"use client";

import {useState, useRef, useEffect} from "react";
import dynamic from "next/dynamic";
import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {CalendarIcon, ClockIcon, X, Camera} from "lucide-react";
import {useJsApiLoader} from "@react-google-maps/api";
import {useAuth} from "@/context/AuthContext";
import {createEvent, uploadEventPoster, assignThemesToEvent} from "@/lib/event";
import {getEventFormats} from "@/lib/format";
import {Event, EventFormat, Theme} from "@/types";
import {getThemes} from "@/lib/theme";
import {showErrorToasts, showSuccessToast} from "@/lib/toast";
import {eventCreateZodSchema, validateEventDates} from "@/zod/shemas";
import {Calendar} from "@/components/ui/calendar";
import {format} from "date-fns";
import {ScrollArea} from "@/components/ui/scroll-area";

const LocationPickerModal = dynamic(() => import("./LocationPickerModal"), {ssr: false});

interface CreateEventModalProps {
    companyId: number;
    isOpen: boolean;
    onClose: () => void;
    onEventCreated: (newEvent: Event) => void;
}

export default function CreateEventModal({companyId, isOpen, onClose, onEventCreated}: CreateEventModalProps) {
    const {user} = useAuth();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        venue: "",
        formatId: "",
        locationCoordinates: "",
        startedAt: "",
        endedAt: "",
    });
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [eventErrors, setEventErrors] = useState<{
        title?: string;
        description?: string;
        venue?: string;
        formatId?: string;
        locationCoordinates?: string;
        startedAt?: string;
        endedAt?: string;
        themes?: string;
    }>({});
    const [formats, setFormats] = useState<EventFormat[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [selectedThemes, setSelectedThemes] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isThemesPopoverOpen, setIsThemesPopoverOpen] = useState(false);
    const [openStartCalendar, setOpenStartCalendar] = useState(false);
    const [openEndCalendar, setOpenEndCalendar] = useState(false);
    const startDate = formData.startedAt ? new Date(formData.startedAt) : undefined;
    const endDate = formData.endedAt ? new Date(formData.endedAt) : undefined;
    const venueInputRef = useRef<HTMLInputElement>(null);
    const [filteredPlaces, setFilteredPlaces] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const {isLoaded} = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE",
        libraries: ["places"],
    });
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    useEffect(() => {
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
        fetchFormatsAndThemes();
    }, []);

    const filterPlaces = (query: string) => {
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
    };

    const handleVenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
        setFormData((prev) => ({...prev, venue: value}));
        filterPlaces(value);
    };

    const handlePlaceSelect = (place: google.maps.places.AutocompletePrediction) => {
        if (!isLoaded) return;

        const placesService = new google.maps.places.PlacesService(document.createElement("div"));
        placesService.getDetails(
            {placeId: place.place_id, fields: ["name", "formatted_address", "geometry"]},
            (placeDetails, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
                    const venue = placeDetails.name || placeDetails.formatted_address || "";
                    const coordinates = placeDetails.geometry?.location
                        ? `${placeDetails.geometry.location.lat()},${placeDetails.geometry.location.lng()}`
                        : "";
                    setFormData((prev) => ({...prev, venue, locationCoordinates: coordinates}));
                    setShowSuggestions(false);
                }
            }
        );
    };

    const handleDateChange = (name: string, date: Date | undefined) => {
        if (!date) {
            setFormData((prev) => ({...prev, [name]: ""}));
            return;
        }

        const time = name === "startedAt" ? startTime : endTime;
        if (time) {
            const [hours, minutes] = time.split(":").map(Number);
            date.setHours(hours, minutes);
        }

        setFormData((prev) => ({...prev, [name]: date.toISOString()}));
    };

    const handleClearVenue = () => {
        setFormData((prev) => ({...prev, venue: "", locationCoordinates: ""}));
        setFilteredPlaces([]);
        setShowSuggestions(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith("image/")) {
                showErrorToasts("Please upload an image file");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showErrorToasts("File size should be less than 5MB");
                return;
            }
            setPosterFile(file);
            setPosterPreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleFileClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleLocationSelect = (venue: string, coordinates: string) => {
        setFormData((prev) => ({...prev, venue, locationCoordinates: coordinates}));
        setIsMapModalOpen(false);
    };

    const handleThemeSelect = (themeId: number) => {
        setSelectedThemes((prev) => (prev.includes(themeId) ? prev : [...prev, themeId]));
    };

    const handleThemeRemove = (themeId: number) => {
        setSelectedThemes((prev) => prev.filter((id) => id !== themeId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const eventData = {
            title: formData.title,
            description: formData.description,
            venue: formData.venue,
            formatId: formData.formatId ? parseInt(formData.formatId, 10) : undefined,
            locationCoordinates: formData.locationCoordinates,
            startedAt: formData.startedAt,
            endedAt: formData.endedAt,
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
            });

            const errorMessages = Object.values(errors)
                .filter((error): error is string[] => error !== undefined)
                .flatMap((error) => error);
            showErrorToasts(errorMessages);
            return;
        }

        try {
            validateEventDates({startedAt: formData.startedAt, endedAt: formData.endedAt});
        } catch (error: any) {
            setEventErrors({endedAt: error.message});
            showErrorToasts([error.message]);
            return;
        }

        setEventErrors({});

        if (!user?.id) return;

        setIsLoading(true);
        try {
            let newEvent: Event | null = null;
            const createResult = await createEvent({
                title: formData.title,
                description: formData.description,
                venue: formData.venue,
                companyId,
                formatId: parseInt(formData.formatId, 10),
                locationCoordinates: formData.locationCoordinates,
                startedAt: formData.startedAt,
                endedAt: formData.endedAt,
            });

            if (!createResult.success || !createResult.data) {
                showErrorToasts(createResult.errors);
                return;
            }
            newEvent = createResult.data;

            if (posterFile) {
                const uploadResult = await uploadEventPoster(newEvent.id, posterFile);
                if (!uploadResult.success || !uploadResult.data) {
                    showErrorToasts(uploadResult.errors);
                    return;
                }
                newEvent.posterName = uploadResult.data.server_filename;
            }

            if (selectedThemes.length > 0) {
                const assignThemesResult = await assignThemesToEvent(newEvent.id, selectedThemes);
                if (!assignThemesResult.success) {
                    showErrorToasts(assignThemesResult.errors);
                    return;
                }
            }

            onEventCreated(newEvent);
            showSuccessToast("Event created successfully");

            setFormData({
                title: "",
                description: "",
                venue: "",
                formatId: "",
                locationCoordinates: "",
                startedAt: "",
                endedAt: "",
            });
            setPosterFile(null);
            setPosterPreview(null);
            setError(null);
            setSelectedThemes([]);
            setStartTime("");
            setEndTime("");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            onClose();
        } catch (error: any) {
            showErrorToasts(error.errors || ["Failed to save event"]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            title: "",
            description: "",
            venue: "",
            formatId: "",
            locationCoordinates: "",
            startedAt: "",
            endedAt: "",
        });
        setPosterFile(null);
        setPosterPreview(null);
        setError(null);
        setSelectedThemes([]);
        setIsThemesPopoverOpen(false);
        setFilteredPlaces([]);
        setShowSuggestions(false);
        setStartTime("");
        setEndTime("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onClose();
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

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent
                    className="border-none w-[1000px] max-w-[90vw] h-[600px] max-h-[100vh] rounded-lg shadow-lg p-0 overflow-y-auto custom-scroll">
                    <DialogTitle className="sr-only">Create a New Event</DialogTitle>
                    <div className="flex flex-col md:flex-row">
                        <div
                            className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center aspect-square md:aspect-auto">
                            <div className="relative group w-full h-full">
                                <div
                                    className="w-full h-full bg-gray-200 rounded-t-lg md:rounded-t-none md:rounded-l-lg flex items-center justify-center cursor-pointer overflow-hidden group-hover:brightness-75 transition-all duration-200"
                                    onClick={handleFileClick}
                                >
                                    {posterPreview ? (
                                        <img
                                            src={posterPreview}
                                            alt="Poster preview"
                                            className="w-full h-full object-cover rounded-t-lg md:rounded-t-none md:rounded-l-lg group-hover:brightness-60 transition-all duration-200"
                                        />
                                    ) : (
                                        <Camera strokeWidth={2.5} className="w-10 h-10 text-gray-500"/>
                                    )}
                                </div>
                                {posterPreview && (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                        <Camera strokeWidth={2.5} className="text-white w-10 h-10"/>
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
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Title"
                                        className="!text-[15px] w-full rounded-md"
                                        disabled={isLoading}
                                    />
                                    {eventErrors.title && <p className="text-sm text-red-500">{eventErrors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Description"
                                        className="!text-[15px] w-full rounded-md min-h-[80px]"
                                        disabled={isLoading}
                                    />
                                    {eventErrors.description &&
                                        <p className="text-sm text-red-500">{eventErrors.description}</p>}
                                </div>

                                <div className="max-w-[320px] space-y-4">
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
                                                        <CalendarIcon
                                                            strokeWidth={2.5}
                                                            className="ml-0 h-4 w-4"
                                                            style={{color: "#727272"}}
                                                        />
                                                        {startDate ? format(startDate, "PPP") : "Start date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="pointer-events-auto">
                                                    <Calendar
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
                                                <SelectTrigger
                                                    className="w-[120px] cursor-pointer disabled:cursor-default">
                                                    <ClockIcon strokeWidth={2.5} className="h-4 w-4"
                                                               style={{color: "#727272"}}/>
                                                    <SelectValue placeholder="Time"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <ScrollArea className="h-48">
                                                        {timeOptions.map((time) => (
                                                            <SelectItem className="cursor-pointer" key={time}
                                                                        value={time}>
                                                                {time}
                                                            </SelectItem>
                                                        ))}
                                                    </ScrollArea>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {eventErrors.startedAt &&
                                            <p className="text-sm text-red-500">{eventErrors.startedAt}</p>}
                                    </div>


                                    <div className=" space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Popover open={openEndCalendar} onOpenChange={setOpenEndCalendar}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`flex-1 font-normal text-[15px] h-9 justify-start ${
                                                            startDate ? "text-black" : "text-gray-500"
                                                        }`} // Условный класс для цвета текста
                                                        disabled={isLoading}
                                                    >
                                                        <CalendarIcon strokeWidth={2.5} className="ml-0 h-4 w-4"
                                                                      style={{color: "#727272"}}/>
                                                        {endDate ? format(endDate, "PPP") : "End date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="pointer-events-auto">
                                                    <Calendar
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
                                                <SelectTrigger
                                                    className="w-[120px] cursor-pointer disabled:cursor-default">
                                                    <ClockIcon strokeWidth={2.5} className="h-4 w-4"
                                                               style={{color: "#727272"}}/>
                                                    <SelectValue placeholder="Time"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <ScrollArea className="h-48">
                                                        {timeOptions.map((time) => (
                                                            <SelectItem className="cursor-pointer" key={time}
                                                                        value={time}>
                                                                {time}
                                                            </SelectItem>
                                                        ))}
                                                    </ScrollArea>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {eventErrors.endedAt &&
                                            <p className="text-sm text-red-500">{eventErrors.endedAt}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-4 flex-col sm:flex-row">
                                        <Select
                                            value={formData.formatId}
                                            onValueChange={(value) => setFormData((prev) => ({
                                                ...prev,
                                                formatId: value
                                            }))}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger
                                                className="cursor-pointer !text-[14px] w-[200px]  rounded-md h-9">
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
                                                style={{position: "fixed"}}
                                            >
                                                <div
                                                    className="flex flex-wrap gap-2 max-h-40 overflow-y-auto"
                                                    tabIndex={0}
                                                    onWheel={(e) => {
                                                        const scrollAmount = e.deltaY;
                                                        e.currentTarget.scrollBy({
                                                            top: scrollAmount,
                                                            behavior: "smooth"
                                                        });
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
                                                            <X className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500"/>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
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
                                        {showSuggestions && filteredPlaces.length > 0 && (
                                            <div
                                                className="absolute left-0 w-full bg-white shadow-lg rounded-b-md border border-gray-300 border-t-0 z-[1003] max-h-[150px] overflow-y-auto custom-scroll">
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
                                </div>
                            </form>

                            <div className="mt-4 flex justify-end space-x-2">
                                <Button variant="outline" onClick={handleClose} className="shadow-md"
                                        disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        isLoading ||
                                        !formData.title ||
                                        !formData.description ||
                                        !formData.venue ||
                                        !formData.formatId ||
                                        !formData.locationCoordinates ||
                                        !formData.startedAt ||
                                        !formData.endedAt
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
                initialVenue={formData.venue}
                initialCoordinates={formData.locationCoordinates}
            />
        </>
    );
}