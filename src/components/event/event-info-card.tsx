"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    CalendarIcon,
    ClockIcon,
    Save,
    Camera,
    X,
    Tag,
    MapPin,
    Calendar,
    Eye,
    FileText,
    Building,
    PenSquare,
} from "lucide-react";
import { useJsApiLoader } from "@react-google-maps/api";
import { cn } from "@/lib/utils";
import { getEventById, updateEvent, uploadEventPoster, assignThemesToEvent } from "@/lib/event";
import { getEventFormats } from "@/lib/format";
import { getThemes } from "@/lib/theme";
import { Event, EventFormat, Theme } from "@/types";
import { showSuccessToast, showErrorToasts } from "@/lib/toast";
import { format } from "date-fns";
import { eventCreateZodSchema, validateEventDates } from "@/zod/shemas";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";

const LocationPickerModal = dynamic(() => import("./LocationPickerModal"), { ssr: false });

type EventInfoCardProps = {
    setEditMode: (editMode: boolean) => void;
    editMode: boolean;
    eventId: number;
};

export default function EventInfoCard({ setEditMode, editMode, eventId }: EventInfoCardProps) {
    const [event, setEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        venue: "",
        formatId: "",
        locationCoordinates: "",
        startedAt: "",
        endedAt: "",
        ticketsAvailableFrom: "",
        attendeeVisibility: "",
        status: "",
        poster: null as File | null,
    });
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
    const startDate = formData.startedAt ? new Date(formData.startedAt) : undefined;
    const endDate = formData.endedAt ? new Date(formData.endedAt) : undefined;
    const ticketsDate = formData.ticketsAvailableFrom ? new Date(formData.ticketsAvailableFrom) : undefined;
    const venueInputRef = useRef<HTMLInputElement>(null);
    const [filteredPlaces, setFilteredPlaces] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [ticketsTime, setTicketsTime] = useState("");

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE",
        libraries: ["places"],
    });

    useEffect(() => {
        const fetchEvent = async () => {
            setIsLoading(true);
            const result = await getEventById(eventId);
            if (result.success && result.data) {
                setEvent(result.data);
                setFormData({
                    title: result.data.title,
                    description: result.data.description,
                    venue: result.data.venue,
                    formatId: result.data.formatId.toString(),
                    locationCoordinates: result.data.locationCoordinates,
                    startedAt: result.data.startedAt,
                    endedAt: result.data.endedAt,
                    ticketsAvailableFrom: result.data.ticketsAvailableFrom,
                    attendeeVisibility: result.data.attendeeVisibility,
                    status: result.data.status,
                    poster: null,
                });
                setSelectedThemes(result.data.themes.map(theme => theme.id));
                setStartTime(format(new Date(result.data.startedAt), "HH:mm"));
                setEndTime(format(new Date(result.data.endedAt), "HH:mm"));
                setTicketsTime(format(new Date(result.data.ticketsAvailableFrom), "HH:mm"));
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

    const imageUrl =
        previewUrl ||
        (event?.posterName
            ? `http://localhost:8080/uploads/event-posters/${event.posterName}`
            : "https://via.placeholder.com/400x600");

    const filterPlaces = (query: string) => {
        if (!isLoaded || query.trim().length < 3) {
            setFilteredPlaces([]);
            setShowSuggestions(false);
            return;
        }

        const autocompleteService = new google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
            { input: query, types: ["establishment", "geocode"] },
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
    };

    const handleVenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({ ...prev, venue: value }));
        filterPlaces(value);
    };

    const handlePlaceSelect = (place: google.maps.places.AutocompletePrediction) => {
        if (!isLoaded) return;

        const placesService = new google.maps.places.PlacesService(document.createElement("div"));
        placesService.getDetails(
            { placeId: place.place_id, fields: ["name", "formatted_address", "geometry"] },
            (placeDetails, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
                    const venue = placeDetails.name || placeDetails.formatted_address || "";
                    const coordinates = placeDetails.geometry?.location
                        ? `${placeDetails.geometry.location.lat()},${placeDetails.geometry.location.lng()}`
                        : "";
                    setFormData((prev) => ({ ...prev, venue, locationCoordinates: coordinates }));
                    setShowSuggestions(false);
                }
            }
        );
    };

    const handleClearVenue = () => {
        setFormData((prev) => ({ ...prev, venue: "", locationCoordinates: "" }));
        setFilteredPlaces([]);
        setShowSuggestions(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setFormData((prev) => ({ ...prev, poster: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleLocationSelect = (venue: string, coordinates: string) => {
        setFormData((prev) => ({ ...prev, venue, locationCoordinates: coordinates }));
        setIsMapModalOpen(false);
    };

    const handleThemeSelect = (themeId: number) => {
        setSelectedThemes((prev) => (prev.includes(themeId) ? prev : [...prev, themeId]));
    };

    const handleThemeRemove = (themeId: number) => {
        setSelectedThemes((prev) => prev.filter((id) => id !== themeId));
    };

    const handleDateChange = (name: string, date: Date | undefined) => {
        if (!date) {
            setFormData((prev) => ({ ...prev, [name]: "" }));
            return;
        }

        const time = name === "startedAt" ? startTime : name === "endedAt" ? endTime : ticketsTime;
        if (time) {
            const [hours, minutes] = time.split(":").map(Number);
            date.setHours(hours, minutes);
        }

        setFormData((prev) => ({ ...prev, [name]: date.toISOString() }));
    };

    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const hourStr = hour.toString().padStart(2, "0");
                const minuteStr = minute.toString().padStart(2, "0");
                times.push(`${hourStr}:${minuteStr}`);
            }
        }
        return times;
    };

    const timeOptions = generateTimeOptions();

    const handleSave = async () => {
        if (!event) return;

        const eventData = {
            title: formData.title,
            description: formData.description,
            venue: formData.venue,
            formatId: formData.formatId ? parseInt(formData.formatId, 10) : undefined,
            locationCoordinates: formData.locationCoordinates,
            startedAt: formData.startedAt,
            endedAt: formData.endedAt,
            ticketsAvailableFrom: formData.ticketsAvailableFrom,
            attendeeVisibility: formData.attendeeVisibility,
            status: formData.status,
        };

        const createValidation = eventCreateZodSchema.safeParse(eventData);

        if (!createValidation.success) {
            const errors = createValidation.error.flatten().fieldErrors;
            setEventErrors({
                title: errors.title?.[0],
                description: errors.description?.[0],
                venue: errors.venue?.[0],
                formatId: errors.formatId?.[0],
                locationCoordinates: errors.locationCoordinates?.[0],
                startedAt: errors.startedAt?.[0],
                endedAt: errors.endedAt?.[0],
                ticketsAvailableFrom: errors.ticketsAvailableFrom?.[0],
                attendeeVisibility: errors.attendeeVisibility?.[0],
                status: errors.status?.[0],
            });

            const errorMessages = Object.values(errors)
                .filter((error): error is string[] => error !== undefined)
                .flatMap((error) => error);
            showErrorToasts(errorMessages);
            return;
        }

        try {
            validateEventDates({ startedAt: formData.startedAt, endedAt: formData.endedAt });
        } catch (error: any) {
            setEventErrors({ endedAt: error.message });
            showErrorToasts([error.message]);
            return;
        }

        setEventErrors({});

        let updatedEvent = { ...event };

        const updateResult = await updateEvent(event.id, {
            title: formData.title,
            description: formData.description,
            venue: formData.venue,
            formatId: parseInt(formData.formatId, 10),
            locationCoordinates: formData.locationCoordinates,
            startedAt: formData.startedAt,
            endedAt: formData.endedAt,
            ticketsAvailableFrom: formData.ticketsAvailableFrom,
            attendeeVisibility: formData.attendeeVisibility,
            status: formData.status,
        });

        if (!updateResult.success || !updateResult.data) {
            showErrorToasts(updateResult.errors);
            return;
        }
        updatedEvent = updateResult.data;

        if (formData.poster) {
            const posterResult = await uploadEventPoster(event.id, formData.poster);
            if (!posterResult.success || !posterResult.data) {
                showErrorToasts(posterResult.errors);
                return;
            }
            updatedEvent.posterName = posterResult.data.server_filename;
        }

        if (selectedThemes.length > 0) {
            const assignThemesResult = await assignThemesToEvent(event.id, selectedThemes);
            if (!assignThemesResult.success) {
                showErrorToasts(assignThemesResult.errors);
                return;
            }
            updatedEvent.themes = themes.filter(theme => selectedThemes.includes(theme.id));
        }

        setEvent(updatedEvent);
        setEditMode(false);
        showSuccessToast("Event updated successfully");
        setFormData({
            title: updatedEvent.title,
            description: updatedEvent.description,
            venue: updatedEvent.venue,
            formatId: updatedEvent.formatId.toString(),
            locationCoordinates: updatedEvent.locationCoordinates,
            startedAt: updatedEvent.startedAt,
            endedAt: updatedEvent.endedAt,
            ticketsAvailableFrom: updatedEvent.ticketsAvailableFrom,
            attendeeVisibility: updatedEvent.attendeeVisibility,
            status: updatedEvent.status,
            poster: null,
        });
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setFormData({
            title: event?.title || "",
            description: event?.description || "",
            venue: event?.venue || "",
            formatId: event?.formatId.toString() || "",
            locationCoordinates: event?.locationCoordinates || "",
            startedAt: event?.startedAt || "",
            endedAt: event?.endedAt || "",
            ticketsAvailableFrom: event?.ticketsAvailableFrom || "",
            attendeeVisibility: event?.attendeeVisibility || "",
            status: event?.status || "",
            poster: null,
        });
        setSelectedThemes(event?.themes.map(theme => theme.id) || []);
        setEventErrors({});
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!event) {
        return <div>Event not found</div>;
    }

    return (
        <Card className="shadow-lg transition-all duration-300 hover:shadow-xl w-[1200px] h-[600px] flex flex-col relative">
            {/* Левая часть: Постер */}
            <div className="absolute top-0 left-0 w-[400px] h-[600px] flex-shrink-0">
                <div className="relative group  h-full">
                    <img
                        src={imageUrl}
                        alt={event.title}
                        className={cn(
                            "w-[400px] rounded-l-lg h-full object-cover",
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
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                <Camera strokeWidth={2.5} className="text-white w-10 h-10" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Правая часть: Контент и футер */}
            <div className="flex-1 flex flex-col ml-[400px] h-[550px]">
                {/* Контент */}
                <CardContent className="flex-1 p-6 overflow-y-auto custom-scroll">
                    {editMode ? (
                        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                            {/* Title */}
                            <div className="space-y-2">
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="!text-[15px] w-full rounded-md"
                                    placeholder="Event title"
                                />
                                {eventErrors.title && <p className="text-sm text-red-500">{eventErrors.title}</p>}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="!text-[15px] w-full rounded-md min-h-[80px]"
                                    placeholder="Event description"
                                />
                                {eventErrors.description && <p className="text-sm text-red-500">{eventErrors.description}</p>}
                            </div>

                            {/* Start Date и End Date */}
                            <div className="max-w-[320px] space-y-4">
                                {/* Start Date */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center space-x-2 w-full">
                                            <Popover open={openStartCalendar} onOpenChange={setOpenStartCalendar}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 font-normal text-[15px] h-9 justify-start"
                                                        disabled={isLoading}
                                                    >
                                                        <CalendarIcon strokeWidth={2.5} className="ml-0 h-4 w-4 mr-2" style={{ color: "#727272" }} />
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
                                                    setStartTime(value);
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
                                                    <ClockIcon strokeWidth={2.5} className="h-4 w-4 mr-2" style={{ color: "#727272" }} />
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
                                    {eventErrors.startedAt && <p className="text-sm text-red-500">{eventErrors.startedAt}</p>}
                                </div>

                                {/* End Date */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center space-x-2 w-full">
                                            <Popover open={openEndCalendar} onOpenChange={setOpenEndCalendar}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 font-normal text-[15px] h-9 justify-start"
                                                        disabled={isLoading}
                                                    >
                                                        <CalendarIcon strokeWidth={2.5} className="ml-0 h-4 w-4 mr-2" style={{ color: "#727272" }} />
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
                                                    setEndTime(value);
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
                                                    <ClockIcon strokeWidth={2.5} className="h-4 w-4 mr-2" style={{ color: "#727272" }} />
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
                                    {eventErrors.endedAt && <p className="text-sm text-red-500">{eventErrors.endedAt}</p>}
                                </div>
                            </div>

                            {/* Format и Themes */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-4 flex-col sm:flex-row">
                                    <Select
                                        value={formData.formatId}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, formatId: value }))}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="cursor-pointer !text-[14px] w-[200px] rounded-md h-9">
                                            <SelectValue placeholder="Select format" />
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
                                                className="rounded-full font-normal text-sm"
                                                disabled={isLoading}
                                            >
                                                Add Themes
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
                                                    const scrollAmount = e.deltaY;
                                                    e.currentTarget.scrollBy({ top: scrollAmount, behavior: "smooth" });
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
                                                            onClick={() => handleThemeSelect(theme.id)}
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
                                                        onClick={() => handleThemeRemove(themeId)}
                                                        className="ml-2 focus:outline-none"
                                                        disabled={isLoading}
                                                    >
                                                        <X className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Venue */}
                            <div className="space-y-2">
                                <div className="relative flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                    <Input
                                        id="venue"
                                        name="venue"
                                        value={formData.venue}
                                        onChange={handleVenueChange}
                                        onFocus={() => {
                                            if (formData.venue.trim() !== "") filterPlaces(formData.venue);
                                        }}
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
                                    {formData.venue && (
                                        <button
                                            type="button"
                                            onClick={handleClearVenue}
                                            className="cursor-pointer absolute right-3 top-1.5 text-gray-500 hover:text-gray-700"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                {showSuggestions && filteredPlaces.length > 0 && (
                                    <div className="absolute left-0 w-full bg-white shadow-lg rounded-b-md border border-gray-300 border-t-0 z-[1003] max-h-[150px] overflow-y-auto">
                                        {filteredPlaces.map((place) => (
                                            <div
                                                key={place.place_id}
                                                onClick={() => handlePlaceSelect(place)}
                                                className="p-3 cursor-pointer hover:bg-gray-100 last:border-b-0"
                                            >
                                                <h4 className="text-[15px]">{place.description}</h4>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                            </div>

                            {/* Дополнительные поля, отсутствующие в CreateEventModal */}

                            {/* Tickets Available From */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                                    <div className="flex items-center space-x-2 w-full">
                                        <Popover open={openTicketsCalendar} onOpenChange={setOpenTicketsCalendar}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 font-normal text-[15px] h-9 justify-start"
                                                    disabled={isLoading}
                                                >
                                                    <CalendarIcon strokeWidth={2.5} className="ml-0 h-4 w-4 mr-2" style={{ color: "#727272" }} />
                                                    {ticketsDate ? format(ticketsDate, "PPP") : "Tickets available from"}
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
                                                    disabled={(date) => date > new Date(event.startedAt)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <Select
                                            onValueChange={(value) => {
                                                setTicketsTime(value);
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
                                                <ClockIcon strokeWidth={2.5} className="h-4 w-4 mr-2" style={{ color: "#727272" }} />
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
                                {eventErrors.ticketsAvailableFrom && (
                                    <p className="text-sm text-red-500">{eventErrors.ticketsAvailableFrom}</p>
                                )}
                            </div>

                            {/* Attendee Visibility */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-gray-500" />
                                    <Select
                                        value={formData.attendeeVisibility}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, attendeeVisibility: value }))}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="cursor-pointer !text-[14px] w-full rounded-md h-9">
                                            <SelectValue placeholder="Attendee Visibility" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-40">
                                            {["EVERYONE", "REGISTERED", "INVITED"].map((visibility) => (
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
                                {eventErrors.attendeeVisibility && (
                                    <p className="text-sm text-red-500">{eventErrors.attendeeVisibility}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <PenSquare className="w-5 h-5 text-gray-500" />
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="cursor-pointer !text-[14px] w-full rounded-md h-9">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-40">
                                            {["DRAFT", "PUBLISHED", "CANCELLED"].map((status) => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                    className="!text-[14px] cursor-pointer py-1"
                                                >
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {eventErrors.status && <p className="text-sm text-red-500">{eventErrors.status}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <p className="text-[27px] font-medium">{event.title}</p>
                            </div>

                            {/* Два столбца для информации */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                {/* Company */}
                                <div className="text-[17px] flex items-center gap-2">
                                    <Building className="w-5 h-5 text-gray-500" />
                                    <span>{event.company.title}</span>
                                </div>

                                {/* Format */}
                                <div className="text-[17px] flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-gray-500" />
                                    <span>{event.format.title} • {event.themes.map((theme) => theme.title).join(", ")}</span>
                                </div>

                                {/* Venue */}
                                <div className="text-[17px] flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                    <span>{event.venue}</span>
                                </div>

                                {/* Event Dates */}
                                <div className="text-[17px] flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                                    <span>
                                        {format(new Date(event.startedAt), "MMMM d, yyyy HH:mm")} -{" "}
                                        {format(new Date(event.endedAt), "MMMM d, yyyy HH:mm")}
                                    </span>
                                </div>

                                {/* Published At */}
                                <div className="text-[17px] flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                                    <span>{format(new Date(event.publishedAt), "MMMM d, yyyy HH:mm")}</span>
                                </div>

                                {/* Tickets Available From */}
                                <div className="text-[17px] flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                                    <span>{format(new Date(event.ticketsAvailableFrom), "MMMM d, yyyy HH:mm")}</span>
                                </div>

                                {/* Attendee Visibility */}
                                <div className="text-[17px] flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-gray-500" />
                                    <span>{event.attendeeVisibility}</span>
                                </div>
                            </div>

                            {/* Description (на всю ширину) */}
                            <div className="text-[17px] mt-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    <p className="text-base text-foreground/70">{event.description}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                {/* Футер */}
                <CardFooter className="bg-white">
                    {editMode ? (
                        <div className="w-full flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="w-[200px]"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={
                                    !formData.title ||
                                    !formData.description ||
                                    !formData.venue ||
                                    !formData.formatId ||
                                    !formData.locationCoordinates ||
                                    !formData.startedAt ||
                                    !formData.endedAt ||
                                    !formData.attendeeVisibility ||
                                    !formData.status
                                }
                                className="w-[200px]"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full flex justify-end">
                            <Button onClick={() => setEditMode(true)} className="w-[200px]">
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
                initialVenue={formData.venue}
                initialCoordinates={formData.locationCoordinates}
            />
        </Card>
    );
}