"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, memo } from "react"
import dynamic from "next/dynamic"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ClockIcon, X, Camera, Tag, Users } from "lucide-react"
import { useJsApiLoader } from "@react-google-maps/api"
import { useAuth } from "@/context/auth-context"
import { createEvent, uploadEventPoster, assignThemesToEvent } from "@/lib/event"
import { getEventFormats } from "@/lib/format"
import type { Event, EventFormat, Theme } from "@/types"
import { getThemes } from "@/lib/theme"
import { showErrorToasts, showSuccessToast } from "@/lib/toast"
import { eventCreateZodSchema, validateEventDates } from "@/zod/shemas"
import { CalendarForm } from "@/components/ui/calendar-form"
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getCityAndCountryFromComponents } from "../google-map/google-map-location-picker-modal";

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

const LocationPickerModal = dynamic(() => import("../google-map/google-map-location-picker-modal"), { ssr: false })

interface CreateEventModalProps {
    companyId: number
    isOpen: boolean
    onClose: () => void
    onEventCreated: (newEvent: Event) => void
}

const TitleDescriptionFields = memo(
    ({
         title,
         description,
         onTitleChange,
         onDescriptionChange,
         errors,
         isLoading,
     }: {
        title: string
        description: string
        onTitleChange: (value: string) => void
        onDescriptionChange: (value: string) => void
        errors: { title?: string; description?: string }
        isLoading: boolean
    }) => {
        const [localTitle, setLocalTitle] = useState(title)
        const [localDescription, setLocalDescription] = useState(description)

        const debouncedTitle = useDebounce(localTitle, 0)
        const debouncedDescription = useDebounce(localDescription, 0)

        useEffect(() => {
            onTitleChange(debouncedTitle)
        }, [debouncedTitle, onTitleChange])

        useEffect(() => {
            onDescriptionChange(debouncedDescription)
        }, [debouncedDescription, onDescriptionChange])

        return (
            <>
                <div className="space-y-2">
                    <Input
                        id="title"
                        name="title"
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        placeholder="Title"
                        className="!text-[15px] w-full rounded-md"
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Textarea
                        id="description"
                        name="description"
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        placeholder="Description"
                        className="!text-[15px] w-full rounded-md min-h-[80px]"
                        disabled={isLoading}
                    />
                </div>
            </>
        )
    }
)

const VenueField = memo(
    ({
         venue,
         onVenueChange,
         onFocus,
         onClearVenue,
         onPlaceSelect,
         showSuggestions,
         filteredPlaces,
         errors,
         isLoading,
         venueInputRef,
     }: {
        venue: string
        onVenueChange: (e: React.ChangeEvent<HTMLInputElement>) => void
        onFocus: () => void
        onClearVenue: () => void
        onPlaceSelect: (place: google.maps.places.AutocompletePrediction) => void
        showSuggestions: boolean
        filteredPlaces: google.maps.places.AutocompletePrediction[]
        errors: { venue?: string }
        isLoading: boolean
        venueInputRef: React.RefObject<HTMLInputElement | null>
    }) => {
        return (
            <div className="space-y-2">
                <div className="relative">
                    <Input
                        id="venue"
                        name="venue"
                        value={venue}
                        onChange={onVenueChange}
                        onFocus={onFocus}
                        placeholder="Venue (e.g., NTU KhPI)"
                        className={`!text-[15px] w-full rounded-md border border-gray-300 py-2 pr-10 ${
                            showSuggestions && filteredPlaces.length > 0
                                ? "rounded-t-md rounded-b-none border-b-gray-200"
                                : "rounded-md"
                        }`}
                        disabled={isLoading}
                        ref={venueInputRef}
                        autoComplete="off"
                    />
                    {venue && (
                        <button
                            type="button"
                            onClick={onClearVenue}
                            className="cursor-pointer absolute right-3 top-1.5 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    )}
                    {showSuggestions && filteredPlaces.length > 0 && (
                        <div className="absolute left-0 w-full bg-white shadow-lg rounded-b-md border border-gray-300 border-t-0 z-[1003] max-h-[150px] overflow-y-auto custom-scroll">
                            {filteredPlaces.map((place) => (
                                <div
                                    key={place.place_id}
                                    onClick={() => onPlaceSelect(place)}
                                    className="p-3 cursor-pointer hover:bg-gray-100 last:border-b-0"
                                >
                                    <h4 className="text-[15px]">{place.description}</h4>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }
)

const DateFields = memo(
    ({
         startDate,
         endDate,
         ticketsDate,
         publishedDate,
         startTime,
         endTime,
         ticketsTime,
         publishedTime,
         openStartCalendar,
         openEndCalendar,
         openTicketsCalendar,
         openPublishedCalendar,
         setOpenStartCalendar,
         setOpenEndCalendar,
         setOpenTicketsCalendar,
         setOpenPublishedCalendar,
         onStartTimeChange,
         onEndTimeChange,
         onTicketsTimeChange,
         onPublishedTimeChange,
         handleDateChange,
         timeOptions,
         isLoading,
         errors,
     }: {
        startDate: Date | undefined
        endDate: Date | undefined
        ticketsDate: Date | undefined
        publishedDate: Date | undefined
        startTime: string
        endTime: string
        ticketsTime: string
        publishedTime: string
        openStartCalendar: boolean
        openEndCalendar: boolean
        openTicketsCalendar: boolean
        openPublishedCalendar: boolean
        setOpenStartCalendar: (value: boolean) => void
        setOpenEndCalendar: (value: boolean) => void
        setOpenTicketsCalendar: (value: boolean) => void
        setOpenPublishedCalendar: (value: boolean) => void
        onStartTimeChange: (value: string) => void
        onEndTimeChange: (value: string) => void
        onTicketsTimeChange: (value: string) => void
        onPublishedTimeChange: (value: string) => void
        handleDateChange: (name: string, date: Date | undefined) => void
        timeOptions: string[]
        isLoading: boolean
        errors: {
            startedAt?: string
            endedAt?: string
            ticketsAvailableFrom?: string
            publishedAt?: string
        }
    }) => {
        return (
            <div className="max-w-[330px] space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Popover open={openStartCalendar} onOpenChange={setOpenStartCalendar}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`flex-1 font-normal text-[15px] h-9 justify-start ${
                                        startDate ? "text-black" : "text-gray-500"
                                    }`}
                                    disabled={isLoading}
                                >
                                    <CalendarIcon strokeWidth={2.5} className="ml-0 h-4 w-4" style={{ color: "#727272" }} />
                                    {startDate ? format(startDate, "PPP") : "Start date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="pointer-events-auto">
                                <CalendarForm
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => {
                                        handleDateChange("startedAt", date)
                                        setOpenStartCalendar(false)
                                    }}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </PopoverContent>
                        </Popover>
                        <Select
                            onValueChange={onStartTimeChange}
                            disabled={isLoading}
                            value={startTime}
                        >
                            <SelectTrigger className="w-[120px] cursor-pointer disabled:cursor-default">
                                <ClockIcon strokeWidth={2.5} className="h-4 w-4" style={{ color: "#727272" }} />
                                <SelectValue placeholder="Time" />
                            </SelectTrigger>
                            <SelectContent>
                                <ScrollArea className="h-48">
                                    {timeOptions.map((time) => (
                                        <SelectItem className="cursor-pointer" key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Popover open={openEndCalendar} onOpenChange={setOpenEndCalendar}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`flex-1 font-normal text-[15px] h-9 justify-start ${
                                        endDate ? "text-black" : "text-gray-500"
                                    }`}
                                    disabled={isLoading}
                                >
                                    <CalendarIcon strokeWidth={2.5} className="ml-0 h-4 w-4" style={{ color: "#727272" }} />
                                    {endDate ? format(endDate, "PPP") : "End date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="pointer-events-auto">
                                <CalendarForm
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => {
                                        handleDateChange("endedAt", date)
                                        setOpenEndCalendar(false)
                                    }}
                                    disabled={(date) =>
                                        startDate ? date < startDate : date < new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                        <Select
                            onValueChange={onEndTimeChange}
                            disabled={isLoading}
                            value={endTime}
                        >
                            <SelectTrigger className="w-[120px] cursor-pointer disabled:cursor-default">
                                <ClockIcon strokeWidth={2.5} className="h-4 w-4" style={{ color: "#727272" }} />
                                <SelectValue placeholder="Time" />
                            </SelectTrigger>
                            <SelectContent>
                                <ScrollArea className="h-48">
                                    {timeOptions.map((time) => (
                                        <SelectItem className="cursor-pointer" key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Popover open={openPublishedCalendar} onOpenChange={setOpenPublishedCalendar}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`flex-1 font-normal text-[15px] h-9 justify-start ${
                                        publishedDate ? "text-black" : "text-gray-500"
                                    }`}
                                    disabled={isLoading}
                                >
                                    <CalendarIcon strokeWidth={2.5} className="ml-0 h-4 w-4" style={{ color: "#727272" }} />
                                    {publishedDate ? format(publishedDate, "PPP") : "Publish date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="pointer-events-auto">
                                <CalendarForm
                                    mode="single"
                                    selected={publishedDate}
                                    onSelect={(date) => {
                                        handleDateChange("publishedAt", date)
                                        setOpenPublishedCalendar(false)
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                        <Select
                            onValueChange={onPublishedTimeChange}
                            disabled={isLoading}
                            value={publishedTime}
                        >
                            <SelectTrigger className="w-[120px] cursor-pointer disabled:cursor-default">
                                <ClockIcon strokeWidth={2.5} className="h-4 w-4" style={{ color: "#727272" }} />
                                <SelectValue placeholder="Time" />
                            </SelectTrigger>
                            <SelectContent>
                                <ScrollArea className="h-48">
                                    {timeOptions.map((time) => (
                                        <SelectItem className="cursor-pointer" key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Popover open={openTicketsCalendar} onOpenChange={setOpenTicketsCalendar}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`flex-1 font-normal text-[15px] h-9 justify-start ${
                                        ticketsDate ? "text-black" : "text-gray-500"
                                    }`}
                                    disabled={isLoading}
                                >
                                    <CalendarIcon strokeWidth={2.5} className="ml-0 h-4 w-4" style={{ color: "#727272" }} />
                                    {ticketsDate ? format(ticketsDate, "PPP") : "Tickets available"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="pointer-events-auto">
                                <CalendarForm
                                    mode="single"
                                    selected={ticketsDate}
                                    onSelect={(date) => {
                                        handleDateChange("ticketsAvailableFrom", date)
                                        setOpenTicketsCalendar(false)
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                        <Select
                            onValueChange={onTicketsTimeChange}
                            disabled={isLoading}
                            value={ticketsTime}
                        >
                            <SelectTrigger className="w-[120px] cursor-pointer disabled:cursor-default">
                                <ClockIcon strokeWidth={2.5} className="h-4 w-4" style={{ color: "#727272" }} />
                                <SelectValue placeholder="Time" />
                            </SelectTrigger>
                            <SelectContent>
                                <ScrollArea className="h-48">
                                    {timeOptions.map((time) => (
                                        <SelectItem className="cursor-pointer" key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        )
    }
)

const FormatThemesFields = memo(
    ({
         formatId,
         onFormatChange,
         formats,
         themes,
         selectedThemes,
         onThemeSelect,
         onThemeRemove,
         isThemesPopoverOpen,
         setIsThemesPopoverOpen,
         errors,
         isLoading,
     }: {
        formatId: string
        onFormatChange: (value: string) => void
        formats: EventFormat[]
        themes: Theme[]
        selectedThemes: number[]
        onThemeSelect: (themeId: number) => void
        onThemeRemove: (themeId: number) => void
        isThemesPopoverOpen: boolean
        setIsThemesPopoverOpen: (value: boolean) => void
        errors: { formatId?: string }
        isLoading: boolean
    }) => {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2 flex-col sm:flex-row">
                    <Select value={formatId} onValueChange={onFormatChange} disabled={isLoading}>
                        <SelectTrigger className="cursor-pointer !text-[14px] w-[195px] rounded-md h-9 justify-start">
                            <Tag strokeWidth={2.5} className="w-4 h-4 text-gray-500" />
                            <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent className="max-h-40">
                            {formats.map((format) => (
                                <SelectItem
                                    key={format.id}
                                    value={format.id.toString()}
                                    className="!text-[14px] cursor-pointer py-1"
                                >
                                    {format.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Popover open={isThemesPopoverOpen} onOpenChange={setIsThemesPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-md w-[120px] font-normal text-sm justify-start"
                                disabled={isLoading}
                            >
                                <Tag strokeWidth={2.5} className="w-4 h-4 text-gray-500" /> Themes
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            sideOffset={5}
                            className="w-80 pointer-events-auto"
                            style={{ position: "fixed" }}
                        >
                            <div
                                className="flex flex-wrap gap-2 max-h-40 overflow-y-auto"
                                tabIndex={0}
                                onWheel={(e) => {
                                    const scrollAmount = e.deltaY
                                    e.currentTarget.scrollBy({ top: scrollAmount, behavior: "smooth" })
                                    e.preventDefault()
                                }}
                                ref={(el) => {
                                    if (isThemesPopoverOpen && el) el.focus()
                                }}
                            >
                                {themes.length > 0 ? (
                                    themes.map((theme) => (
                                        <Button
                                            key={theme.id}
                                            type="button"
                                            variant={selectedThemes.includes(theme.id) ? "default" : "outline"}
                                            className="text-[14px] font-normal rounded-full"
                                            onClick={() => onThemeSelect(theme.id)}
                                            disabled={isLoading}
                                        >
                                            {theme.title}
                                        </Button>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No themes available</p>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                {selectedThemes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {selectedThemes.map((themeId) => {
                            const theme = themes.find((t) => t.id === themeId)
                            if (!theme) return null
                            return (
                                <div
                                    key={themeId}
                                    className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700"
                                >
                                    <span>{theme.title}</span>
                                    <button
                                        type="button"
                                        onClick={() => onThemeRemove(themeId)}
                                        className="ml-2 focus:outline-none"
                                        disabled={isLoading}
                                    >
                                        <X className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }
)

const StatusVisibilityFields = memo(
    ({
         status,
         attendeeVisibility,
         onStatusChange,
         onAttendeeVisibilityChange,
         errors,
         isLoading,
     }: {
        status: string
        attendeeVisibility: string
        onStatusChange: (value: string) => void
        onAttendeeVisibilityChange: (value: string) => void
        errors: { status?: string; attendeeVisibility?: string }
        isLoading: boolean
    }) => {
        return (
            <div className="max-w-[330px] space-y-4">
                <div className="space-y-2 w-[323px]">
                    <Select value={status} onValueChange={onStatusChange} disabled={isLoading}>
                        <SelectTrigger className="cursor-pointer !text-[14px] w-full rounded-md h-9 justify-start">
                            <Tag strokeWidth={2.5} className="w-4 h-4 text-gray-500" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="max-h-40">
                            {["DRAFT", "PUBLISHED", "SALES_STARTED", "ONGOING", "FINISHED", "CANCELLED"].map((status) => (
                                <SelectItem key={status} value={status} className="!text-[14px] cursor-pointer py-1">
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 w-[323px]">
                    <Select
                        value={attendeeVisibility}
                        onValueChange={onAttendeeVisibilityChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="cursor-pointer !text-[14px] w-full rounded-md h-9 justify-start">
                            <Users strokeWidth={2.5} className="w-4 h-4 text-gray-500" />
                            <SelectValue placeholder="Attendee Visibility" />
                        </SelectTrigger>
                        <SelectContent className="max-h-40">
                            {["EVERYONE", "ATTENDEES_ONLY", "NOBODY"].map((visibility) => (
                                <SelectItem
                                    key={visibility}
                                    value={visibility}
                                    className="!text-[14px] cursor-pointer py-1"
                                >
                                    {visibility}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        )
    }
)

export default function EventCreateModal({ companyId, isOpen, onClose, onEventCreated }: CreateEventModalProps) {
    const { user } = useAuth()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [venue, setVenue] = useState("")
    const [formatId, setFormatId] = useState("")
    const [locationCoordinates, setLocationCoordinates] = useState("")
    const [startedAt, setStartedAt] = useState("")
    const [endedAt, setEndedAt] = useState("")
    const [publishedAt, setPublishedAt] = useState("")
    const [ticketsAvailableFrom, setTicketsAvailableFrom] = useState("")
    const [status, setStatus] = useState("")
    const [attendeeVisibility, setAttendeeVisibility] = useState("")
    const [posterFile, setPosterFile] = useState<File | null>(null)
    const [posterPreview, setPosterPreview] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [eventErrors, setEventErrors] = useState<{
        title?: string
        description?: string
        venue?: string
        formatId?: string
        locationCoordinates?: string
        startedAt?: string
        endedAt?: string
        themes?: string
        publishedAt?: string
        ticketsAvailableFrom?: string
        status?: string
        attendeeVisibility?: string
    }>({})
    const [formats, setFormats] = useState<EventFormat[]>([])
    const [themes, setThemes] = useState<Theme[]>([])
    const [selectedThemes, setSelectedThemes] = useState<number[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isMapModalOpen, setIsMapModalOpen] = useState(false)
    const [isThemesPopoverOpen, setIsThemesPopoverOpen] = useState(false)
    const [openStartCalendar, setOpenStartCalendar] = useState(false)
    const [openEndCalendar, setOpenEndCalendar] = useState(false)
    const [openPublishedCalendar, setOpenPublishedCalendar] = useState(false)
    const [openTicketsCalendar, setOpenTicketsCalendar] = useState(false)
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [publishedTime, setPublishedTime] = useState("")
    const [ticketsTime, setTicketsTime] = useState("")
    const venueInputRef = useRef<HTMLInputElement>(null)
    const [filteredPlaces, setFilteredPlaces] = useState<google.maps.places.AutocompletePrediction[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE",
        libraries: ["places"],
    })

    const startDate = startedAt ? new Date(startedAt) : undefined
    const endDate = endedAt ? new Date(endedAt) : undefined
    const publishedDate = publishedAt ? new Date(publishedAt) : undefined
    const ticketsDate = ticketsAvailableFrom ? new Date(ticketsAvailableFrom) : undefined

    useEffect(() => {
        const fetchFormatsAndThemes = async () => {
            const formatResult = await getEventFormats()
            if (formatResult.success && formatResult.data) {
                setFormats(formatResult.data)
            } else {
                showErrorToasts(formatResult.errors || ["Failed to load event formats"])
            }

            const themesResult = await getThemes()
            if (themesResult.success && themesResult.data) {
                setThemes(themesResult.data)
            } else {
                showErrorToasts(themesResult.errors || ["Failed to load themes"])
            }
        }
        fetchFormatsAndThemes()
    }, [])

    const filterPlaces = useCallback((query: string) => {
        if (!isLoaded || query.trim().length < 3) {
            setFilteredPlaces([])
            setShowSuggestions(false)
            return
        }

        const autocompleteService = new google.maps.places.AutocompleteService()
        autocompleteService.getPlacePredictions(
            { input: query, types: ["establishment", "geocode"] },
            (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setFilteredPlaces(predictions)
                    setShowSuggestions(true)
                } else {
                    setFilteredPlaces([])
                    setShowSuggestions(false)
                }
            }
        )
    }, [isLoaded])

    const handleVenueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        setVenue(value)
        filterPlaces(value)
    }, [filterPlaces])

    const handleVenueFocus = useCallback(() => {
        if (venue.trim().length >= 3) {
            filterPlaces(venue)
        }
    }, [venue, filterPlaces])

    const handlePlaceSelect = useCallback((place: google.maps.places.AutocompletePrediction) => {
        if (!isLoaded) return;

        const placesService = new google.maps.places.PlacesService(document.createElement("div"));
        placesService.getDetails(
            {
                placeId: place.place_id,
                fields: ["name", "formatted_address", "geometry", "address_components"], // Добавляем address_components
            },
            (placeDetails, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
                    const venueName = placeDetails.name || placeDetails.formatted_address || "";
                    const coordinates = placeDetails.geometry?.location
                        ? `${placeDetails.geometry.location.lat()},${placeDetails.geometry.location.lng()}`
                        : "";

                    // Извлекаем город и страну
                    const { city, country } = getCityAndCountryFromComponents(placeDetails);
                    const formattedVenue = city && country ? `${venueName}, ${city}, ${country}` : venueName;

                    setVenue(formattedVenue);
                    setLocationCoordinates(coordinates);
                    setShowSuggestions(false);
                    setFilteredPlaces([]);
                }
            }
        );
    }, [isLoaded]);

    const handleClearVenue = useCallback(() => {
        setVenue("")
        setLocationCoordinates("")
        setFilteredPlaces([])
        setShowSuggestions(false)
    }, [])

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (!file.type.startsWith("image/")) {
                showErrorToasts("Please upload an image file")
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                showErrorToasts("File size should be less than 5MB")
                return
            }
            setPosterFile(file)
            setPosterPreview(URL.createObjectURL(file))
            setError(null)
        }
    }, [])

    const handleFileClick = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }, [])

    const handleLocationSelect = useCallback((venue: string, coordinates: string) => {
        setVenue(venue)
        setLocationCoordinates(coordinates)
        setIsMapModalOpen(false)
    }, [])

    const handleThemeSelect = useCallback((themeId: number) => {
        setSelectedThemes((prev) => (prev.includes(themeId) ? prev : [...prev, themeId]))
    }, [])

    const handleThemeRemove = useCallback((themeId: number) => {
        setSelectedThemes((prev) => prev.filter((id) => id !== themeId))
    }, [])

    const handleDateChange = useCallback((name: string, date: Date | undefined) => {
        if (!date) {
            if (name === "startedAt") setStartedAt("")
            if (name === "endedAt") setEndedAt("")
            if (name === "publishedAt") setPublishedAt("")
            if (name === "ticketsAvailableFrom") setTicketsAvailableFrom("")
            return
        }

        const time =
            name === "startedAt"
                ? startTime
                : name === "endedAt"
                    ? endTime
                    : name === "publishedAt"
                        ? publishedTime
                        : ticketsTime
        if (time) {
            const [hours, minutes] = time.split(":").map(Number)
            date.setHours(hours, minutes)
        }

        const isoDate = date.toISOString()
        if (name === "startedAt") setStartedAt(isoDate)
        if (name === "endedAt") setEndedAt(isoDate)
        if (name === "publishedAt") setPublishedAt(isoDate)
        if (name === "ticketsAvailableFrom") setTicketsAvailableFrom(isoDate)
    }, [startTime, endTime, publishedTime, ticketsTime])

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        const eventData = {
            title,
            description,
            venue,
            formatId: formatId ? Number.parseInt(formatId, 10) : undefined,
            locationCoordinates,
            startedAt,
            endedAt,
            publishedAt,
            ticketsAvailableFrom,
            status,
            attendeeVisibility,
        }

        const createValidation = eventCreateZodSchema.safeParse(eventData)

        if (!createValidation.success) {
            const errors = createValidation.error.flatten().fieldErrors
            setEventErrors({
                title: errors.title?.[0],
                description: errors.description?.[0],
                venue: errors.venue?.[0],
                formatId: errors.formatId?.[0],
                locationCoordinates: errors.locationCoordinates?.[0],
                startedAt: errors.startedAt?.[0],
                endedAt: errors.endedAt?.[0],
            })

            const errorMessages = Object.values(errors)
                .filter((error): error is string[] => error !== undefined)
                .flat()
            showErrorToasts(errorMessages)
            return
        }

        try {
            validateEventDates({ startedAt, endedAt })
        } catch (error: any) {
            setEventErrors({ endedAt: error.message })
            showErrorToasts([error.message])
            return
        }

        setEventErrors({})

        if (!user?.id) return

        setIsLoading(true)
        try {
            let newEvent: Event | null = null
            const createResult = await createEvent({
                title,
                description,
                venue,
                companyId,
                formatId: Number.parseInt(formatId, 10),
                locationCoordinates,
                startedAt,
                endedAt,
                publishedAt,
                ticketsAvailableFrom,
                status,
                attendeeVisibility,
            })

            if (!createResult.success || !createResult.data) {
                showErrorToasts(createResult.errors)
                return
            }
            newEvent = createResult.data

            if (posterFile) {
                const uploadResult = await uploadEventPoster(newEvent.id, posterFile)
                if (!uploadResult.success || !uploadResult.data) {
                    showErrorToasts(uploadResult.errors)
                    return
                }
                newEvent.posterName = uploadResult.data.server_filename
            }

            if (selectedThemes.length > 0) {
                const assignThemesResult = await assignThemesToEvent(newEvent.id, selectedThemes)
                if (!assignThemesResult.success) {
                    showErrorToasts(assignThemesResult.errors)
                    return
                }
            }

            onEventCreated(newEvent)
            showSuccessToast("Event created successfully")

            setTitle("")
            setDescription("")
            setVenue("")
            setFormatId("")
            setLocationCoordinates("")
            setStartedAt("")
            setEndedAt("")
            setPublishedAt("")
            setTicketsAvailableFrom("")
            setStatus("")
            setAttendeeVisibility("")
            setPosterFile(null)
            setPosterPreview(null)
            setError(null)
            setSelectedThemes([])
            setStartTime("")
            setEndTime("")
            setPublishedTime("")
            setTicketsTime("")
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
            onClose()
        } catch (error: any) {
            showErrorToasts(error.errors || ["Failed to save event"])
        } finally {
            setIsLoading(false)
        }
    }, [
        title,
        description,
        venue,
        formatId,
        locationCoordinates,
        startedAt,
        endedAt,
        publishedAt,
        ticketsAvailableFrom,
        status,
        attendeeVisibility,
        posterFile,
        selectedThemes,
        user?.id,
        companyId,
        onEventCreated,
        onClose,
    ])

    const handleClose = useCallback(() => {
        setTitle("")
        setDescription("")
        setVenue("")
        setFormatId("")
        setLocationCoordinates("")
        setStartedAt("")
        setEndedAt("")
        setPublishedAt("")
        setTicketsAvailableFrom("")
        setStatus("")
        setAttendeeVisibility("")
        setPosterFile(null)
        setPosterPreview(null)
        setError(null)
        setSelectedThemes([])
        setIsThemesPopoverOpen(false)
        setFilteredPlaces([])
        setShowSuggestions(false)
        setStartTime("")
        setEndTime("")
        setPublishedTime("")
        setTicketsTime("")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        onClose()
    }, [onClose])

    const generateTimeOptions = useCallback(() => {
        const times = []
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const hourStr = hour.toString().padStart(2, "0")
                const minuteStr = minute.toString().padStart(2, "0")
                times.push(`${hourStr}:${minuteStr}`)
            }
        }
        return times
    }, [])

    const timeOptions = generateTimeOptions()

    const handleStartTimeChange = useCallback((value: string) => {
        setStartTime(value)
        if (startDate) {
            const updatedDate = new Date(startDate)
            const [hours, minutes] = value.split(":").map(Number)
            updatedDate.setHours(hours, minutes)
            handleDateChange("startedAt", updatedDate)
        }
    }, [startDate, handleDateChange])

    const handleEndTimeChange = useCallback((value: string) => {
        setEndTime(value)
        if (endDate) {
            const updatedDate = new Date(endDate)
            const [hours, minutes] = value.split(":").map(Number)
            updatedDate.setHours(hours, minutes)
            handleDateChange("endedAt", updatedDate)
        }
    }, [endDate, handleDateChange])

    const handlePublishedTimeChange = useCallback((value: string) => {
        setPublishedTime(value)
        if (publishedDate) {
            const updatedDate = new Date(publishedDate)
            const [hours, minutes] = value.split(":").map(Number)
            updatedDate.setHours(hours, minutes)
            handleDateChange("publishedAt", updatedDate)
        }
    }, [publishedDate, handleDateChange])

    const handleTicketsTimeChange = useCallback((value: string) => {
        setTicketsTime(value)
        if (ticketsDate) {
            const updatedDate = new Date(ticketsDate)
            const [hours, minutes] = value.split(":").map(Number)
            updatedDate.setHours(hours, minutes)
            handleDateChange("ticketsAvailableFrom", updatedDate)
        }
    }, [ticketsDate, handleDateChange])

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="border-none w-[1000px] max-w-[90vw] h-[600px] max-h-[100vh] rounded-lg shadow-lg p-0 overflow-auto md:overflow-hidden custom-scroll">
                    <DialogTitle className="sr-only">Create a New Event</DialogTitle>
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/2 flex items-center justify-center aspect-square md:aspect-auto">
                            <div className="relative group w-full h-full">
                                <div
                                    className="w-full h-[600px] bg-gray-200 rounded-t-lg md:rounded-t-none md:rounded-l-lg flex items-center justify-center cursor-pointer overflow-hidden group-hover:brightness-75 transition-all duration-200"
                                    onClick={handleFileClick}
                                >
                                    {posterPreview ? (
                                        <img
                                            src={posterPreview || "/placeholder.svg"}
                                            alt="Poster preview"
                                            className="w-full h-full object-cover rounded-t-lg md:rounded-t-none md:rounded-l-lg group-hover:brightness-60 transition-all duration-200"
                                        />
                                    ) : (
                                        <Camera strokeWidth={2.5} className="w-10 h-10 text-gray-500" />
                                    )}
                                </div>
                                {posterPreview && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                        <Camera strokeWidth={2.5} className="text-white w-10 h-10" />
                                    </div>
                                )}
                                <input
                                    id="poster"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
                            <ScrollArea className="h-[520px] pr-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <TitleDescriptionFields
                                        title={title}
                                        description={description}
                                        onTitleChange={setTitle}
                                        onDescriptionChange={setDescription}
                                        errors={eventErrors}
                                        isLoading={isLoading}
                                    />
                                    <VenueField
                                        venue={venue}
                                        onVenueChange={handleVenueChange}
                                        onFocus={handleVenueFocus}
                                        onClearVenue={handleClearVenue}
                                        onPlaceSelect={handlePlaceSelect}
                                        showSuggestions={showSuggestions}
                                        filteredPlaces={filteredPlaces}
                                        errors={eventErrors}
                                        isLoading={isLoading}
                                        venueInputRef={venueInputRef}
                                    />
                                    <div className="flex justify-end mt-1">
                                        <Button
                                            type="button"
                                            onClick={() => setIsMapModalOpen(true)}
                                            className="text-[14px]"
                                            variant="link"
                                            disabled={isLoading}
                                        >
                                            Open Map Search
                                        </Button>
                                    </div>
                                    <DateFields
                                        startDate={startDate}
                                        endDate={endDate}
                                        ticketsDate={ticketsDate}
                                        publishedDate={publishedDate}
                                        startTime={startTime}
                                        endTime={endTime}
                                        ticketsTime={ticketsTime}
                                        publishedTime={publishedTime}
                                        openStartCalendar={openStartCalendar}
                                        openEndCalendar={openEndCalendar}
                                        openTicketsCalendar={openTicketsCalendar}
                                        openPublishedCalendar={openPublishedCalendar}
                                        setOpenStartCalendar={setOpenStartCalendar}
                                        setOpenEndCalendar={setOpenEndCalendar}
                                        setOpenTicketsCalendar={setOpenTicketsCalendar}
                                        setOpenPublishedCalendar={setOpenPublishedCalendar}
                                        onStartTimeChange={handleStartTimeChange}
                                        onEndTimeChange={handleEndTimeChange}
                                        onTicketsTimeChange={handleTicketsTimeChange}
                                        onPublishedTimeChange={handlePublishedTimeChange}
                                        handleDateChange={handleDateChange}
                                        timeOptions={timeOptions}
                                        isLoading={isLoading}
                                        errors={eventErrors}
                                    />
                                    <FormatThemesFields
                                        formatId={formatId}
                                        onFormatChange={setFormatId}
                                        formats={formats}
                                        themes={themes}
                                        selectedThemes={selectedThemes}
                                        onThemeSelect={handleThemeSelect}
                                        onThemeRemove={handleThemeRemove}
                                        isThemesPopoverOpen={isThemesPopoverOpen}
                                        setIsThemesPopoverOpen={setIsThemesPopoverOpen}
                                        errors={eventErrors}
                                        isLoading={isLoading}
                                    />
                                    <StatusVisibilityFields
                                        status={status}
                                        attendeeVisibility={attendeeVisibility}
                                        onStatusChange={setStatus}
                                        onAttendeeVisibilityChange={setAttendeeVisibility}
                                        errors={eventErrors}
                                        isLoading={isLoading}
                                    />
                                </form>
                            </ScrollArea>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={handleClose} className="shadow-md" disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        isLoading ||
                                        !title ||
                                        !description ||
                                        !venue ||
                                        !formatId ||
                                        !locationCoordinates ||
                                        !startedAt ||
                                        !endedAt ||
                                        !publishedAt ||
                                        !ticketsAvailableFrom ||
                                        !status ||
                                        !attendeeVisibility
                                    }
                                    className="shadow-md"
                                    onClick={handleSubmit}
                                >
                                    Create
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <LocationPickerModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                onSelect={handleLocationSelect}
                initialVenue={venue}
                initialCoordinates={locationCoordinates}
            />
        </>
    )
}