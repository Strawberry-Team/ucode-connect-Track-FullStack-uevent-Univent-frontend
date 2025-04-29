"use client";

import React, {useState, useEffect, useRef, useCallback, useMemo, memo} from "react";
import dynamic from "next/dynamic";
import {debounce} from "lodash";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Skeleton} from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
    CalendarIcon,
    ClockIcon,
    Save,
    Camera,
    X,
    Tag,
    MapPin,
    FileText,
    Building,
    Users,
    Clock, 
    Ticket, 
    Palette
} from "lucide-react";
import {useJsApiLoader} from "@react-google-maps/api";
import {cn} from "@/lib/utils";
import {getEventById, updateEvent, uploadEventPoster, assignThemesToEvent} from "@/lib/events";
import {getEventFormats} from "@/lib/formats";
import {getThemes} from "@/lib/themes";
import {Event, EventFormat, Theme} from "@/types/event";
import {showSuccessToast, showErrorToasts} from "@/lib/toast";
import {format} from "date-fns";
import {eventCreateZodSchema, validateEventDates} from "@/zod/shemas";
import {ScrollArea} from "@/components/ui/scroll-area";
import {getCityAndCountryFromComponents} from "@/components/google-map/google-map-location-picker-modal";
import { EventInfoCardProps } from "@/types/event";

const CalendarComponent = dynamic(() => import("@/components/ui/calendar-form").then(mod => mod.CalendarForm), {ssr: false});
const LocationPickerModal = dynamic(() => import("../google-map/google-map-location-picker-modal"), {ssr: false});
const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

const TitleDescriptionFields = memo(
    ({
         title,
         description,
         onTitleChange,
         onDescriptionChange,
         errors,
         isLoading,
     }: {
        title: string;
        description: string;
        onTitleChange: (value: string) => void;
        onDescriptionChange: (value: string) => void;
        errors: { title?: string; description?: string };
        isLoading: boolean;
    }) => {
        return (
            <>
                <div className="space-y-2">
                    <Input
                        id="title"
                        name="title"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="!text-[15px] w-full rounded-md"
                        placeholder="Event title"
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        className="!text-[15px] w-full rounded-md min-h-[80px]"
                        placeholder="Event description"
                        disabled={isLoading}
                    />
                </div>
            </>
        );
    }
);

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
        venue: string;
        onVenueChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Обновляем тип
        onFocus: () => void;
        onClearVenue: () => void;
        onPlaceSelect: (place: google.maps.places.AutocompletePrediction) => void;
        showSuggestions: boolean;
        filteredPlaces: google.maps.places.AutocompletePrediction[];
        errors: { venue?: string };
        isLoading: boolean;
        venueInputRef: React.RefObject<HTMLInputElement | null>;
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
                        <div
                            className="absolute left-0 w-full bg-white shadow-lg rounded-b-md border border-gray-300 border-t-0 z-[1003] max-h-[150px] overflow-y-auto custom-scroll">
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
        );
    }
);

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
         startedAt,
     }: {
        startDate: Date | undefined;
        endDate: Date | undefined;
        ticketsDate: Date | undefined;
        publishedDate: Date | undefined;
        startTime: string;
        endTime: string;
        ticketsTime: string;
        publishedTime: string;
        openStartCalendar: boolean;
        openEndCalendar: boolean;
        openTicketsCalendar: boolean;
        openPublishedCalendar: boolean;
        setOpenStartCalendar: (value: boolean) => void;
        setOpenEndCalendar: (value: boolean) => void;
        setOpenTicketsCalendar: (value: boolean) => void;
        setOpenPublishedCalendar: (value: boolean) => void;
        onStartTimeChange: (value: string) => void;
        onEndTimeChange: (value: string) => void;
        onTicketsTimeChange: (value: string) => void;
        onPublishedTimeChange: (value: string) => void;
        handleDateChange: (name: string, date: Date | undefined) => void;
        timeOptions: string[];
        isLoading: boolean;
        errors: {
            startedAt?: string;
            endedAt?: string;
            ticketsAvailableFrom?: string;
            publishedAt?: string;
        };
        startedAt: string;
    }) => {
        const getMinutesFromTime = (time: string) => {
            if (!time) return 0;
            const [hours, minutes] = time.split(":").map(Number);
            return hours * 60 + minutes;
        };

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
                                    <CalendarIcon strokeWidth={2.5} className="ml-0 h-4 w-4"
                                                  style={{color: "#727272"}}/>
                                    {startDate ? format(startDate, "PPP") : "Start date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="pointer-events-auto">
                                <CalendarComponent
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => {
                                        handleDateChange("startedAt", date);
                                        setOpenStartCalendar(false);
                                    }}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </PopoverContent>
                        </Popover>
                        <Select
                            onValueChange={(value) => {
                                onStartTimeChange(value);
                                if (startDate) {
                                    const updatedDate = new Date(startDate);
                                    const [hours, minutes] = value.split(":").map(Number);
                                    updatedDate.setHours(hours, minutes);
                                    handleDateChange("startedAt", updatedDate);
                                }
                            }}
                            disabled={isLoading}
                            value={startTime}
                        >
                            <SelectTrigger className="w-[120px] cursor-pointer disabled:cursor-default">
                                <ClockIcon strokeWidth={2.5} className="h-4 w-4" style={{color: "#727272"}}/>
                                <SelectValue placeholder="Time"/>
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
                                    <CalendarIcon strokeWidth={2.5} className="ml-0 h-4 w-4"
                                                  style={{color: "#727272"}}/>
                                    {endDate ? format(endDate, "PPP") : "End date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="pointer-events-auto">
                                <CalendarComponent
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => {
                                        handleDateChange("endedAt", date);
                                        setOpenEndCalendar(false);
                                    }}
                                    disabled={(date) =>
                                        (startDate ? date < startDate : date < new Date(new Date().setHours(0, 0, 0, 0)))
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                        <Select
                            onValueChange={(value) => {
                                onEndTimeChange(value);
                                if (endDate) {
                                    const updatedDate = new Date(endDate);
                                    const [hours, minutes] = value.split(":").map(Number);
                                    updatedDate.setHours(hours, minutes);
                                    handleDateChange("endedAt", updatedDate);
                                }
                            }}
                            disabled={isLoading}
                            value={endTime}
                        >
                            <SelectTrigger className="w-[120px] cursor-pointer disabled:cursor-default">
                                <ClockIcon strokeWidth={2.5} className="h-4 w-4" style={{color: "#727272"}}/>
                                <SelectValue placeholder="Time"/>
                            </SelectTrigger>
                            <SelectContent>
                                <ScrollArea className="h-48">
                                    {timeOptions.map((time) => {
                                        const startMinutes = getMinutesFromTime(startTime);
                                        const endMinutes = getMinutesFromTime(time);
                                        const isTimeDisabled =  endMinutes < startMinutes + 60;

                                        return (
                                            <SelectItem
                                                className="cursor-pointer"
                                                key={time}
                                                value={time}
                                                disabled={isTimeDisabled}
                                            >
                                                {time}
                                            </SelectItem>
                                        );
                                    })}
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
                                    <CalendarIcon strokeWidth={2.5} className="ml-0 h-4 w-4"
                                                  style={{color: "#727272"}}/>
                                    {publishedDate ? format(publishedDate, "PPP") : "Publish date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="pointer-events-auto">
                                <CalendarComponent
                                    mode="single"
                                    selected={publishedDate}
                                    onSelect={(date) => {
                                        handleDateChange("publishedAt", date);
                                        setOpenPublishedCalendar(false);
                                    }}
                                    disabled={(date) =>
                                        startDate ? date > startDate : date > new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                        <Select
                            onValueChange={(value) => {
                                onPublishedTimeChange(value);
                                if (publishedDate) {
                                    const updatedDate = new Date(publishedDate);
                                    const [hours, minutes] = value.split(":").map(Number);
                                    updatedDate.setHours(hours, minutes);
                                    handleDateChange("publishedAt", updatedDate);
                                }
                            }}
                            disabled={isLoading}
                            value={publishedTime}
                        >
                            <SelectTrigger className="w-[120px] cursor-pointer disabled:cursor-default">
                                <ClockIcon strokeWidth={2.5} className="h-4 w-4" style={{color: "#727272"}}/>
                                <SelectValue placeholder="Time"/>
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
                                    <CalendarIcon strokeWidth={2.5} className="ml-0 h-4 w-4"
                                                  style={{color: "#727272"}}/>
                                    {ticketsDate ? format(ticketsDate, "PPP") : "Tickets available"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="pointer-events-auto">
                                <CalendarComponent
                                    mode="single"
                                    selected={ticketsDate}
                                    onSelect={(date) => {
                                        handleDateChange("ticketsAvailableFrom", date);
                                        setOpenTicketsCalendar(false);
                                    }}
                                    disabled={(date) =>
                                        startDate ? date > startDate : date > new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                        <Select
                            onValueChange={(value) => {
                                onTicketsTimeChange(value);
                                if (ticketsDate) {
                                    const updatedDate = new Date(ticketsDate);
                                    const [hours, minutes] = value.split(":").map(Number);
                                    updatedDate.setHours(hours, minutes);
                                    handleDateChange("ticketsAvailableFrom", updatedDate);
                                }
                            }}
                            disabled={isLoading}
                            value={ticketsTime}
                        >
                            <SelectTrigger className="w-[120px] cursor-pointer disabled:cursor-default">
                                <ClockIcon strokeWidth={2.5} className="h-4 w-4" style={{color: "#727272"}}/>
                                <SelectValue placeholder="Time"/>
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
        );
    }
);

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
        formatId: string;
        onFormatChange: (value: string) => void;
        formats: EventFormat[];
        themes: Theme[];
        selectedThemes: number[];
        onThemeSelect: (themeId: number) => void;
        onThemeRemove: (themeId: number) => void;
        isThemesPopoverOpen: boolean;
        setIsThemesPopoverOpen: (value: boolean) => void;
        errors: { formatId?: string };
        isLoading: boolean;
    }) => {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2 flex-col sm:flex-row">
                    <Select
                        value={formatId}
                        onValueChange={onFormatChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="cursor-pointer !text-[14px] w-[203px] rounded-md h-9 justify-start">
                            <Tag strokeWidth={2.5} className="w-4 h-4 text-gray-500"/>
                            <SelectValue placeholder="Format"/>
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
                                <Palette strokeWidth={2.5} className="w-4 h-4 text-gray-500"/> Themes
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            sideOffset={5}
                            className="w-80 pointer-events-auto"
                            style={{position: "fixed"}}
                        >
                            <div
                                className="flex flex-wrap gap-2 max-h-40 overflow-y-auto"
                                tabIndex={0}
                                onWheel={(e) => {
                                    const scrollAmount = e.deltaY;
                                    e.currentTarget.scrollBy({top: scrollAmount, behavior: "smooth"});
                                    e.preventDefault();
                                }}
                                ref={(el) => {
                                    if (isThemesPopoverOpen && el) el.focus();
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
                            const theme = themes.find((t) => t.id === themeId);
                            if (!theme) return null;
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
                                        <X className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500"/>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }
);

const StatusVisibilityFields = memo(
    ({
         status,
         attendeeVisibility,
         onStatusChange,
         onAttendeeVisibilityChange,
         errors,
         isLoading,
     }: {
        status: string;
        attendeeVisibility: string;
        onStatusChange: (value: string) => void;
        onAttendeeVisibilityChange: (value: string) => void;
        errors: { status?: string; attendeeVisibility?: string };
        isLoading: boolean;
    }) => {
        return (
            <div className="max-w-[330px] space-y-4">
                <div className="space-y-2">
                    <Select
                        value={status}
                        onValueChange={onStatusChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="cursor-pointer !text-[14px] w-full rounded-md h-9 justify-start">
                            <Tag strokeWidth={2.5} className="w-4 h-4 text-gray-500"/>
                            <SelectValue placeholder="Status"/>
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
                <div className="space-y-2 ">
                    <Select
                        value={attendeeVisibility}
                        onValueChange={onAttendeeVisibilityChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="cursor-pointer !text-[14px] w-full rounded-md h-9 justify-start">
                            <Users strokeWidth={2.5} className="w-4 h-4 text-gray-500"/>
                            <SelectValue placeholder="Attendee Visibility"/>
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
        );
    }
);

export default function EventInfoCard({setEditMode, editMode, eventId}: EventInfoCardProps) {
    const [event, setEvent] = useState<Event | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [venue, setVenue] = useState("");
    const [formatId, setFormatId] = useState("");
    const [locationCoordinates, setLocationCoordinates] = useState("");
    const [startedAt, setStartedAt] = useState("");
    const [endedAt, setEndedAt] = useState("");
    const [ticketsAvailableFrom, setTicketsAvailableFrom] = useState("");
    const [attendeeVisibility, setAttendeeVisibility] = useState("");
    const [status, setStatus] = useState("");
    const [publishedAt, setPublishedAt] = useState("");
    const [poster, setPoster] = useState<File | null>(null);
    const [eventErrors, setEventErrors] = useState<{
        title?: string;
        description?: string;
        venue?: string;
        formatId?: string;
        locationCoordinates?: string;
        startedAt?: string;
        endedAt?: string;
        ticketsAvailableFrom?: string;
        attendeeVisibility?: string;
        status?: string;
        publishedAt?: string;
    }>({});
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formats, setFormats] = useState<EventFormat[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [selectedThemes, setSelectedThemes] = useState<number[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isThemesPopoverOpen, setIsThemesPopoverOpen] = useState(false);
    const [openStartCalendar, setOpenStartCalendar] = useState(false);
    const [openEndCalendar, setOpenEndCalendar] = useState(false);
    const [openTicketsCalendar, setOpenTicketsCalendar] = useState(false);
    const [openPublishedCalendar, setOpenPublishedCalendar] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [ticketsTime, setTicketsTime] = useState("");
    const [publishedTime, setPublishedTime] = useState("");
    const venueInputRef = useRef<HTMLInputElement | null>(null);
    const [filteredPlaces, setFilteredPlaces] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const {isLoaded} = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE",
        libraries: GOOGLE_MAPS_LIBRARIES,
    });

    const startDate = useMemo(() => (startedAt ? new Date(startedAt) : undefined), [startedAt]);
    const endDate = useMemo(() => (endedAt ? new Date(endedAt) : undefined), [endedAt]);
    const ticketsDate = useMemo(() => (ticketsAvailableFrom ? new Date(ticketsAvailableFrom) : undefined), [ticketsAvailableFrom]);
    const publishedDate = useMemo(() => (publishedAt ? new Date(publishedAt) : undefined), [publishedAt]);

    const timeOptions = useMemo(() => {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const hourStr = hour.toString().padStart(2, "0");
                const minuteStr = minute.toString().padStart(2, "0");
                times.push(`${hourStr}:${minuteStr}`);
            }
        }
        return times;
    }, []);

    useEffect(() => {
        const fetchEvent = async () => {
            setIsLoading(true);
            const result = await getEventById(eventId);
            if (result.success && result.data) {
                setEvent(result.data);
                setTitle(result.data.title);
                setDescription(result.data.description);
                setVenue(result.data.venue);
                setFormatId(result.data.formatId.toString());
                setLocationCoordinates(result.data.locationCoordinates);
                setStartedAt(result.data.startedAt);
                setEndedAt(result.data.endedAt);
                setTicketsAvailableFrom(result.data.ticketsAvailableFrom);
                setAttendeeVisibility(result.data.attendeeVisibility);
                setStatus(result.data.status);
                setPublishedAt(result.data.publishedAt);
                setPoster(null);
                setSelectedThemes(result.data.themes.map(theme => theme.id));
                setStartTime(format(new Date(result.data.startedAt), "HH:mm"));
                setEndTime(format(new Date(result.data.endedAt), "HH:mm"));
                setTicketsTime(format(new Date(result.data.ticketsAvailableFrom), "HH:mm"));
                setPublishedTime(format(new Date(result.data.publishedAt), "HH:mm"));
            } else {
                showErrorToasts(result.errors);
            }
            setIsLoading(false);
        };

        const fetchFormatsAndThemes = async () => {
            const formatResult = await getEventFormats();
            if (formatResult.success && formatResult.data) {
                setFormats(formatResult.data);
            } else {
                showErrorToasts(formatResult.errors || ["Failed to load event formats"]);
            }

            const themesResult = await getThemes();
            if (themesResult.success && themesResult.data) {
                setThemes(themesResult.data);
            } else {
                showErrorToasts(themesResult.errors || ["Failed to load themes"]);
            }
        };

        fetchEvent();
        fetchFormatsAndThemes();
    }, [eventId]);

    const imageUrl = useMemo(() =>
            previewUrl ||
            (event?.posterName
                ? `http://localhost:8080/uploads/event-posters/${event.posterName}`
                : "https://via.placeholder.com/400x600"),
        [previewUrl, event?.posterName]
    );

    const filterPlaces = useCallback((query: string) => {
        if (!isLoaded || query.trim().length < 3) {
            setFilteredPlaces([]);
            setShowSuggestions(false);
            return;
        }

        const autocompleteService = new google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
            {input: query, types: ["establishment", "geocode"]},
            (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setFilteredPlaces(predictions);
                    setShowSuggestions(true);
                } else {
                    setFilteredPlaces([]);
                    setShowSuggestions(false);
                }
            }
        );
    }, [isLoaded]);

    const debouncedSetTitle = useCallback(
        debounce((value: string) => {
            setTitle(value);
        },),
        []
    );

    const debouncedSetDescription = useCallback(
        debounce((value: string) => {
            setDescription(value);
        },),
        []
    );

    const debouncedSetFormatId = useCallback(
        debounce((value: string) => {
            setFormatId(value);
        },),
        []
    );

    const debouncedSetStatus = useCallback(
        debounce((value: string) => {
            setStatus(value);
        },),
        []
    );

    const debouncedSetAttendeeVisibility = useCallback(
        debounce((value: string) => {
            setAttendeeVisibility(value);
        },),
        []
    );

    const debouncedSetStartTime = useCallback(
        debounce((value: string) => {
            setStartTime(value);
        },),
        []
    );

    const debouncedSetEndTime = useCallback(
        debounce((value: string) => {
            setEndTime(value);
        },),
        []
    );

    const debouncedSetTicketsTime = useCallback(
        debounce((value: string) => {
            setTicketsTime(value);
        },),
        []
    );

    const debouncedSetPublishedTime = useCallback(
        debounce((value: string) => {
            setPublishedTime(value);
        },),
        []
    );

    const handleVenueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
        setVenue(value);
        filterPlaces(value);
    }, [filterPlaces]);

    const handleVenueFocus = useCallback(() => {
        if (venue.trim().length >= 3) {
            filterPlaces(venue);
        }
    }, [venue, filterPlaces]);

    const handlePlaceSelect = useCallback((place: google.maps.places.AutocompletePrediction) => {
        if (!isLoaded) return;

        const placesService = new google.maps.places.PlacesService(document.createElement("div"));
        placesService.getDetails(
            {
                placeId: place.place_id,
                fields: ["name", "formatted_address", "geometry", "address_components"],
            },
            (placeDetails, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
                    const name = placeDetails.name || placeDetails.formatted_address || "";
                    const coordinates = placeDetails.geometry?.location
                        ? `${placeDetails.geometry.location.lat()},${placeDetails.geometry.location.lng()}`
                        : "";

                    const { city, country } = getCityAndCountryFromComponents(placeDetails);
                    const formattedVenue = city && country ? `${name}, ${city}, ${country}` : name;

                    setVenue(formattedVenue);
                    setLocationCoordinates(coordinates);
                    setShowSuggestions(false);
                }
            }
        );
    }, [isLoaded]);

    const handleClearVenue = useCallback(() => {
        setVenue("");
        setLocationCoordinates("");
        setFilteredPlaces([]);
        setShowSuggestions(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        switch (name) {
            case "title":
                debouncedSetTitle(value);
                break;
            case "description":
                debouncedSetDescription(value);
                break;
            default:
                break;
        }
    }, [debouncedSetTitle, debouncedSetDescription]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                showErrorToasts("Please upload an image file");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showErrorToasts("File size should be less than 5MB");
                return;
            }
            setPoster(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }, []);

    const handleLocationSelect = useCallback((venue: string, coordinates: string) => {
        setVenue(venue);
        setLocationCoordinates(coordinates);
        setIsMapModalOpen(false);
    }, []);

    const handleThemeSelect = useCallback((themeId: number) => {
        setSelectedThemes((prev) => (prev.includes(themeId) ? prev : [...prev, themeId]));
    }, []);

    const handleThemeRemove = useCallback((themeId: number) => {
        setSelectedThemes((prev) => prev.filter((id) => id !== themeId));
    }, []);

    const handleDateChange = useCallback((name: string, date: Date | undefined) => {
        if (!date) {
            if (name === "startedAt") setStartedAt("");
            if (name === "endedAt") setEndedAt("");
            if (name === "ticketsAvailableFrom") setTicketsAvailableFrom("");
            if (name === "publishedAt") setPublishedAt("");
            return;
        }

        const time = name === "startedAt" ? startTime : name === "endedAt" ? endTime : name === "ticketsAvailableFrom" ? ticketsTime : publishedTime;
        if (time) {
            const [hours, minutes] = time.split(":").map(Number);
            date.setHours(hours, minutes);
        }

        const isoDate = date.toISOString();
        if (name === "startedAt") setStartedAt(isoDate);
        if (name === "endedAt") setEndedAt(isoDate);
        if (name === "ticketsAvailableFrom") setTicketsAvailableFrom(isoDate);
        if (name === "publishedAt") setPublishedAt(isoDate);
    }, [startTime, endTime, ticketsTime, publishedTime]);

    const handleSave = useCallback(async () => {
        if (!event) return;

        await new Promise((resolve) => setTimeout(resolve, 250));

        const eventData = {
            title,
            description,
            venue,
            formatId: parseInt(formatId, 10),
            locationCoordinates,
            startedAt,
            endedAt,
            ticketsAvailableFrom,
            attendeeVisibility,
            status,
            publishedAt,
        };

        const createValidation = eventCreateZodSchema.safeParse(eventData);

        if (!createValidation.success) {
            const errors = createValidation.error.flatten().fieldErrors;
            setEventErrors({
                title: errors.title?.[0],
                description: errors.description?.[0],
                venue: errors.venue?.[0],
                formatId: errors.formatId?.[0],
                startedAt: errors.startedAt?.[0],
                endedAt: errors.endedAt?.[0],
            });

            const errorMessages = Object.values(errors)
                .filter((error): error is string[] => error !== undefined)
                .flatMap((error) => error);
            showErrorToasts(errorMessages);
            return;
        }

        try {
            validateEventDates({startedAt, endedAt});
        } catch (error: any) {
            setEventErrors({endedAt: error.message});
            showErrorToasts([error.message]);
            return;
        }

        setEventErrors({});

        const updateResult = await updateEvent(event.id, eventData);
        if (!updateResult.success || !updateResult.data) {
            showErrorToasts(updateResult.errors || ["Failed to update event"]);
            return;
        }

        let updatedEvent = updateResult.data;

        if (poster) {
            const posterResult = await uploadEventPoster(event.id, poster);
            if (!posterResult.success || !posterResult.data) {
                showErrorToasts(posterResult.errors || ["Failed to upload poster"]);
                return;
            }
            updatedEvent.posterName = posterResult.data.server_filename;
        }

        if (selectedThemes.length > 0) {
            const assignThemesResult = await assignThemesToEvent(event.id, selectedThemes);
            if (!assignThemesResult.success) {
                showErrorToasts(assignThemesResult.errors || ["Failed to assign themes"]);
                return;
            }
            updatedEvent.themes = themes.filter(theme => selectedThemes.includes(theme.id));
        }

        setEvent(updatedEvent);
        setEditMode(false);
        showSuccessToast("Event updated successfully");
        setTitle(updatedEvent.title);
        setDescription(updatedEvent.description);
        setVenue(updatedEvent.venue);
        setFormatId(updatedEvent.formatId.toString());
        setLocationCoordinates(updatedEvent.locationCoordinates);
        setStartedAt(updatedEvent.startedAt);
        setEndedAt(updatedEvent.endedAt);
        setTicketsAvailableFrom(updatedEvent.ticketsAvailableFrom);
        setAttendeeVisibility(updatedEvent.attendeeVisibility);
        setStatus(updatedEvent.status);
        setPublishedAt(updatedEvent.publishedAt);
        setPoster(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    }, [event, title, description, venue, formatId, locationCoordinates, startedAt, endedAt, ticketsAvailableFrom, attendeeVisibility, status, publishedAt, poster, selectedThemes, themes, previewUrl, setEditMode]);

    const handleCancel = useCallback(() => {
        setEditMode(false);
        setTitle(event?.title || "");
        setDescription(event?.description || "");
        setVenue(event?.venue || "");
        setFormatId(event?.formatId.toString() || "");
        setLocationCoordinates(event?.locationCoordinates || "");
        setStartedAt(event?.startedAt || "");
        setEndedAt(event?.endedAt || "");
        setTicketsAvailableFrom(event?.ticketsAvailableFrom || "");
        setAttendeeVisibility(event?.attendeeVisibility || "");
        setStatus(event?.status || "");
        setPublishedAt(event?.publishedAt || "");
        setPoster(null);
        setSelectedThemes(event?.themes.map(theme => theme.id) || []);
        setEventErrors({});
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    }, [event, previewUrl, setEditMode]);

    if (isLoading) {
        return (
            <Card className="shadow-lg transition-all overflow-hidden duration-300 hover:shadow-xl w-[1200px] h-[600px] flex flex-col relative">
                <div className="absolute top-0 left-0 w-[33%] min-w-[100px] max-w-[400px] h-[600px] flex-shrink-0">
                    <Skeleton className="w-full h-full rounded-l-lg" />
                </div>
                <div className="flex-1 flex flex-col ml-[33%] ml:min-w-[200px] ml:max-w-[400px] h-[550px]">
                    <CardContent className="mt-3 flex-1 p-6 overflow-y-auto custom-scroll">
                        <div className="space-y-6">
                            <Skeleton className="h-[30px] w-[200px]" />
                            <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-[20px] w-[150px]" />
                                    </div>
                                    <div className="mt-6 flex items-center gap-2">
                                        <Skeleton className="h-[20px] w-[150px]" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-[20px] w-[250px]" />
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <Skeleton className="h-[20px] w-[150px]" />
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-[20px] w-[100px]" />
                                    </div>
                                    <div className="mt-6 flex items-center gap-2">
                                        <Skeleton className="h-[20px] w-[150px]" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-[20px] w-[100px]" />
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <Skeleton className="h-[20px] w-[150px]" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex items-center gap-2">
                                <Skeleton className="h-[20px] w-[300px]" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-white">
                        <div className="w-full flex justify-end">
                            <Skeleton className="h-9 w-[200px]" />
                        </div>
                    </CardFooter>
                </div>
            </Card>
        );
    }

    if (!event) {
        return <div>Event not found</div>;
    }

    return (
        <TooltipProvider>
            <Card
                className="shadow-lg transition-all overflow-hidden duration-300 hover:shadow-xl w-[1200px] h-[600px] flex flex-col relative">
                <div className="absolute top-0 left-0 w-[33%] min-w-[100px] max-w-[400px] h-[600px] flex-shrink-0">
                    <div className="relative group h-full">
                        <img
                            src={imageUrl}
                            alt={event.title}
                            className={cn(
                                "w-full rounded-l-lg h-full object-cover",
                                editMode && "cursor-pointer group-hover:brightness-60 transition-all duration-200"
                            )}
                            onClick={() => editMode && document.getElementById("poster")?.click()}
                        />
                        {editMode && (
                            <>
                                <input
                                    id="poster"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div
                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    <Camera strokeWidth={2.5} className="text-white w-10 h-10"/>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-1 flex flex-col ml-[33%] ml:min-w-[200px] ml:max-w-[400px] h-[550px]">
                    <CardContent className="flex-1 p-6 overflow-y-auto custom-scroll">
                        {editMode ? (
                            <div className="animate-in slide-in-from-bottom-4 duration-300">
                                <ScrollArea className="h-[460px] pr-4">
                                    <div className="space-y-4">
                                        <TitleDescriptionFields
                                            title={title}
                                            description={description}
                                            onTitleChange={debouncedSetTitle}
                                            onDescriptionChange={debouncedSetDescription}
                                            errors={eventErrors}
                                            isLoading={isLoading}
                                        />
                                        <VenueField
                                            venue={venue}
                                            onVenueChange={handleVenueChange} // Обновляем onVenueChange
                                            onFocus={handleVenueFocus} // Используем handleVenueFocus
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
                                            onStartTimeChange={debouncedSetStartTime}
                                            onEndTimeChange={debouncedSetEndTime}
                                            onTicketsTimeChange={debouncedSetTicketsTime}
                                            onPublishedTimeChange={debouncedSetPublishedTime}
                                            handleDateChange={handleDateChange}
                                            timeOptions={timeOptions}
                                            isLoading={isLoading}
                                            errors={eventErrors}
                                            startedAt={startedAt}
                                        />
                                        <FormatThemesFields
                                            formatId={formatId}
                                            onFormatChange={debouncedSetFormatId}
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
                                            onStatusChange={debouncedSetStatus}
                                            onAttendeeVisibilityChange={debouncedSetAttendeeVisibility}
                                            errors={eventErrors}
                                            isLoading={isLoading}
                                        />
                                    </div>
                                </ScrollArea>
                            </div>
                        ) : event ? (
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[27px] font-medium">{event.title}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    {/* Первая колонка */}
                                    <div className="space-y-4">
                                        <div className="text-[17px] flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Building className="w-5 h-5 text-gray-500 flex-shrink-0 self-center" strokeWidth={2.5} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Company</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <span>{event.company.title}</span>
                                        </div>
                                        <div className="text-[17px] flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 self-center" strokeWidth={2.5} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Venue</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <span>{event.venue}</span>
                                        </div>
                                        <div className="text-[17px] flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Clock className="w-5 h-5 text-gray-500 flex-shrink-0 self-center" strokeWidth={2.5} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Event Duration</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <span>
                                            {format(new Date(event.startedAt), "MMMM d, yyyy HH:mm")} -{" "}
                                                {format(new Date(event.endedAt), "MMMM d, yyyy HH:mm")}
                                        </span>
                                        </div>
                                        <div className="text-[17px] flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <CalendarIcon className="w-5 h-5 text-gray-500 flex-shrink-0 self-center" strokeWidth={2.5} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Published At</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <span>{format(new Date(event.publishedAt), "MMMM d, yyyy HH:mm")}</span>
                                        </div>
                                    </div>

                                    {/* Вторая колонка */}
                                    <div className="space-y-4">
                                        <div className="text-[17px] flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Tag className="w-5 h-5 text-gray-500 flex-shrink-0 self-center" strokeWidth={2.5} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Format</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <span>{event.format.title}</span>
                                        </div>
                                        <div className="text-[17px] flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Palette className="w-5 h-5 text-gray-500 flex-shrink-0 self-center" strokeWidth={2.5} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Themes</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <span>{event.themes.map((theme) => theme.title).join(", ")}</span>
                                        </div>
                                        <div className="text-[17px] flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Users className="w-5 h-5 text-gray-500 flex-shrink-0 self-center" strokeWidth={2.5} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Attendee Visibility</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <span>{event.attendeeVisibility}</span>
                                        </div>
                                        <div className="text-[17px] flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Ticket className="w-5 h-5 text-gray-500 flex-shrink-0 self-center" strokeWidth={2.5} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Tickets Available From</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <span>{format(new Date(event.ticketsAvailableFrom), "MMMM d, yyyy HH:mm")}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[17px] mt-4">
                                    <div className="flex items-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <FileText strokeWidth={2.5} className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Description</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <p>{event.description}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>Event not found</div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-white">
                        {editMode ? (
                            <div className="w-full flex justify-end gap-3 animate-in fade-in duration-300">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="w-[200px] transition-none"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={
                                        !title ||
                                        !description ||
                                        !venue ||
                                        !formatId ||
                                        !locationCoordinates ||
                                        !startedAt ||
                                        !endedAt ||
                                        !attendeeVisibility ||
                                        !status
                                    }
                                    className="w-[200px] transition-none"
                                >
                                    <Save className="h-4 w-4 mr-2"/>
                                    Save Changes
                                </Button>
                            </div>
                        ) : (
                            <div className="w-full flex justify-end animate-in fade-in duration-300">
                                <Button
                                    onClick={() => setEditMode(true)}
                                    className="w-[200px] transition-none"
                                >
                                    Edit Event
                                </Button>
                            </div>
                        )}
                    </CardFooter>
                </div>
                <LocationPickerModal
                    isOpen={isMapModalOpen}
                    onClose={() => setIsMapModalOpen(false)}
                    onSelect={handleLocationSelect}
                    initialVenue={venue}
                    initialCoordinates={locationCoordinates}
                />
            </Card>
        </TooltipProvider>
    );
}