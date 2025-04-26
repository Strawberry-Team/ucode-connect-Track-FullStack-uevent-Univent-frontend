"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showErrorToasts } from "@/lib/toast";
import { Star, MapPin, Clock, Phone, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];
const DEFAULT_CENTER = { lat: 50.4501, lng: 30.5234 };
const SIDEBAR_WIDTH = 350;
const ZOOM_DEFAULT = 15;

interface LocationPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (venue: string, coordinates: string) => void;
    initialVenue: string;
    initialCoordinates: string;
}

interface PlaceDetails {
    name: string;
    address: string;
    coordinates: string;
    rating?: number;
    reviews?: number;
    openingHours?: string[];
    phone?: string;
    website?: string;
    photo?: string;
    location?: google.maps.LatLngLiteral;
    isOpen24Hours?: boolean;
}

const parseCoordinates = (coords: string): google.maps.LatLngLiteral | null => {
    if (!coords) return null;
    const [lat, lng] = coords.split(",").map(Number);
    return isNaN(lat) || isNaN(lng) ? null : { lat, lng };
};

export const getCityAndCountryFromComponents = (placeDetails: google.maps.places.PlaceResult | google.maps.GeocoderResult): { city: string; country: string } => {
    let city = "";
    let country = "";

    if (placeDetails.address_components) {
        for (const component of placeDetails.address_components) {
            if (component.types.includes("locality")) {
                city = component.long_name;
            }
            if (component.types.includes("country")) {
                country = component.long_name;
            }
        }
    }

    return { city, country };
};

const createPlaceDetails = (
    placeDetails: google.maps.places.PlaceResult,
    fallbackCoordinates: string,
    fallbackLocation?: google.maps.LatLngLiteral
): PlaceDetails => {
    const isOpen24Hours =
        placeDetails.opening_hours?.isOpen() &&
        placeDetails.opening_hours.weekday_text?.every((day) => day.includes("24 hours"));

    return {
        name: placeDetails.name || "",
        address: placeDetails.formatted_address || "",
        coordinates: placeDetails.geometry?.location
            ? `${placeDetails.geometry.location.lat()},${placeDetails.geometry.location.lng()}`
            : fallbackCoordinates,
        rating: placeDetails.rating,
        reviews: placeDetails.user_ratings_total,
        openingHours: placeDetails.opening_hours?.weekday_text,
        phone: placeDetails.formatted_phone_number,
        website: placeDetails.website,
        photo: placeDetails.photos?.[0]?.getUrl({ maxWidth: 400 }),
        location: placeDetails.geometry?.location?.toJSON() || fallbackLocation,
        isOpen24Hours,
    };
};

export default function GoogleMapLocationPickerModal({
                                                isOpen,
                                                onClose,
                                                onSelect,
                                                initialVenue,
                                                initialCoordinates,
                                            }: LocationPickerModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const [venue, setVenue] = useState(initialVenue);
    const [coordinates, setCoordinates] = useState(initialCoordinates);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredPlaces, setFilteredPlaces] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isHoursExpanded, setIsHoursExpanded] = useState(false);
    const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(null);
    const [zoom, setZoom] = useState(ZOOM_DEFAULT);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE",
        libraries: GOOGLE_MAPS_LIBRARIES,
    });

    const getLngOffset = useCallback((pixels: number, zoomLevel: number, latitude: number) => {
        const metersPerPixel = (40075016.686 * Math.cos((latitude * Math.PI) / 180)) / (256 * Math.pow(2, zoomLevel));
        return (pixels * metersPerPixel) / 111320;
    }, []);

    const centerMapWithOffset = useCallback(
        (location: google.maps.LatLngLiteral) => {
            const offsetPixels = SIDEBAR_WIDTH / 2;
            const currentZoom = mapRef.current?.getZoom() || zoom;
            const lngOffset = getLngOffset(offsetPixels, currentZoom, location.lat);
            setMapCenter({ lat: location.lat, lng: location.lng - lngOffset });
        },
        [getLngOffset, zoom]
    );

    const resetState = () => {
        setVenue(initialVenue);
        setCoordinates(initialCoordinates);
        setSelectedPlace(null);
        setSearchQuery(initialVenue);
        setFilteredPlaces([]);
        setShowSuggestions(false);
    };

    const fetchPlaceDetails = (
        place: google.maps.places.AutocompletePrediction,
        fallbackCoordinates: string,
        fallbackLocation?: google.maps.LatLngLiteral
    ) => {
        const placesService = new google.maps.places.PlacesService(document.createElement("div"));
        placesService.getDetails(
            {
                placeId: place.place_id,
                fields: [
                    "name",
                    "formatted_address",
                    "address_components",
                    "geometry",
                    "rating",
                    "user_ratings_total",
                    "opening_hours",
                    "formatted_phone_number",
                    "website",
                    "photos",
                ],
            },
            (placeDetails, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
                    const newPlace = createPlaceDetails(placeDetails, fallbackCoordinates, fallbackLocation);
                    setVenue(newPlace.name);
                    setCoordinates(newPlace.coordinates);
                    setSelectedPlace(newPlace);

                    const { city, country } = getCityAndCountryFromComponents(placeDetails);
                    const formattedQuery = city && country ? `${country}, ${city}, ${newPlace.name}` : newPlace.name;
                    setSearchQuery(formattedQuery);

                    setShowSuggestions(false);
                    if (newPlace.location) centerMapWithOffset(newPlace.location);
                }
            }
        );
    };

    useEffect(() => {
        resetState();

        if (!initialVenue) {
            setSelectedPlace(null);
            setSearchQuery("");
            setMapCenter(null);
            return;
        }

        const initialLocation = parseCoordinates(initialCoordinates);
        if (initialLocation) centerMapWithOffset(initialLocation);

        if (isLoaded && initialVenue.trim().length >= 3) {
            const autocompleteService = new google.maps.places.AutocompleteService();
            autocompleteService.getPlacePredictions(
                { input: initialVenue, types: ["establishment", "geocode"] },
                (predictions, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions?.length) {
                        fetchPlaceDetails(predictions[0], initialCoordinates, initialLocation || undefined);
                    } else {
                        setSelectedPlace(null);
                    }
                }
            );
        }
    }, [initialVenue, initialCoordinates, isLoaded, isOpen, centerMapWithOffset]);

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
                setFilteredPlaces(status === google.maps.places.PlacesServiceStatus.OK && predictions ? predictions : []);
                setShowSuggestions(status === google.maps.places.PlacesServiceStatus.OK && !!predictions);
            }
        );
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        filterPlaces(query);
    };

    const handlePlaceSelect = (place: google.maps.places.AutocompletePrediction) => {
        if (!isLoaded) return;
        fetchPlaceDetails(place, "");
    };

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        if (!isLoaded || !event.latLng) return;

        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        const clickedLocation = { lat, lng };
        const coordinates = `${lat},${lng}`;

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: clickedLocation }, (results, status) => {
            if (status !== google.maps.GeocoderStatus.OK || !results?.[0]) return;

            const place = results[0];
            const newPlace: PlaceDetails = {
                name: place.formatted_address || "Неизвестное место",
                address: place.formatted_address || "",
                coordinates,
                location: clickedLocation,
            };

            const placesService = new google.maps.places.PlacesService(document.createElement("div"));
            placesService.nearbySearch(
                { location: clickedLocation, radius: 50, type: "point_of_interest" },
                (nearbyResults, nearbyStatus) => {
                    if (nearbyStatus === google.maps.places.PlacesServiceStatus.OK && nearbyResults?.[0]) {
                        placesService.getDetails(
                            {
                                placeId: nearbyResults[0].place_id!,
                                fields: [
                                    "name",
                                    "formatted_address",
                                    "address_components",
                                    "geometry",
                                    "rating",
                                    "user_ratings_total",
                                    "opening_hours",
                                    "formatted_phone_number",
                                    "website",
                                    "photos",
                                ],
                            },
                            (placeDetails, detailStatus) => {
                                const updatedPlace =
                                    detailStatus === google.maps.places.PlacesServiceStatus.OK && placeDetails
                                        ? createPlaceDetails(placeDetails, coordinates, clickedLocation)
                                        : newPlace;

                                setVenue(updatedPlace.name);
                                setCoordinates(updatedPlace.coordinates);
                                setSelectedPlace(updatedPlace);

                                const { city, country } = getCityAndCountryFromComponents(placeDetails || place);
                                const formattedQuery = city && country ? `${updatedPlace.name}, ${city}, ${country}` : updatedPlace.name;
                                setSearchQuery(formattedQuery);

                                setShowSuggestions(false);
                                centerMapWithOffset(clickedLocation);
                            }
                        );
                    } else {
                        setVenue(newPlace.name);
                        setCoordinates(newPlace.coordinates);
                        setSelectedPlace(newPlace);

                        const { city, country } = place.address_components
                            ? getCityAndCountryFromComponents(place)
                            : { city: "", country: "" };
                        const formattedQuery = city && country ? `${country}, ${city}, ${newPlace.name}` : newPlace.name;
                        setSearchQuery(formattedQuery);

                        setShowSuggestions(false);
                        centerMapWithOffset(clickedLocation);
                    }
                }
            );
        });
    };

    const handleApply = () => {
        if (!venue || !coordinates) {
            showErrorToasts(["Please select a place"]);
            return;
        }
        onSelect(searchQuery, coordinates);
    };

    const handleClose = () => {
        setVenue(initialVenue);
        setCoordinates(initialCoordinates);
        setSearchQuery("");
        setSelectedPlace(null);
        setFilteredPlaces([]);
        setShowSuggestions(false);
        setMapCenter(null);
        onClose();
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setSelectedPlace(null);
        setFilteredPlaces([]);
        setShowSuggestions(false);
        setMapCenter(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="w-[1000px] max-w-[90vw] h-[700px] max-h-[90vh] rounded-lg shadow-lg p-0 z-[1000] !sm:max-w-[900px]">
                <DialogTitle className="sr-only">Select Location</DialogTitle>
                <div className="relative w-full h-full">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={{ width: "100%", height: "100%", borderRadius: "1%" }}
                            center={mapCenter || DEFAULT_CENTER}
                            zoom={zoom}
                            options={{
                                mapTypeControl: false,
                                streetViewControl: false,
                                fullscreenControl: false,
                                rotateControl: false,
                            }}
                            onClick={handleMapClick}
                            onLoad={(map) => {
                                mapRef.current = map;
                            }}
                            onZoomChanged={() => {
                                if (mapRef.current) setZoom(mapRef.current.getZoom() || ZOOM_DEFAULT);
                            }}
                        >
                            {selectedPlace?.location && <Marker position={selectedPlace.location} />}
                        </GoogleMap>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <p>Загрузка карты...</p>
                        </div>
                    )}

                    <div className="absolute top-0 left-0 w-[350px] h-full z-[1001]">
                        {selectedPlace && (
                            <div className="border-r rounded-l-lg bg-white absolute top-0 left-0 w-full h-full overflow-y-auto custom-scroll z-[1]">
                                {selectedPlace.photo && (
                                    <img src={selectedPlace.photo} alt={selectedPlace.name} className="w-full h-80 object-cover rounded-tl-md mb-2" />
                                )}
                                <div className="flex flex-col gap-5 px-4">
                                    <h3 className={`text-[19px] font-semibold text-gray-900 ${!selectedPlace.photo ? "mt-15" : ""}`}>
                                        {selectedPlace.name}
                                    </h3>
                                    {selectedPlace.rating && (
                                        <div className="-mt-2 border-b flex items-center">
                                            <Star className="w-5 h-5 mr-2 text-yellow-500" />
                                            <span className="text-sm text-gray-600">
                                                {selectedPlace.rating} ({selectedPlace.reviews} отзывов)
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-start">
                                        <MapPin className="w-5 h-5 mr-2 text-gray-600 mt-1 flex-shrink-0" />
                                        <p className="text-sm">{selectedPlace.address}</p>
                                    </div>
                                    {selectedPlace.openingHours && (
                                        <div>
                                            {selectedPlace.isOpen24Hours ? (
                                                <div className="flex items-center">
                                                    <Clock className="w-5 h-5 mr-2 text-gray-600" />
                                                    <p className="text-sm">Круглосуточно</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div
                                                        className="flex items-center cursor-pointer"
                                                        onClick={() => setIsHoursExpanded(!isHoursExpanded)}
                                                    >
                                                        <Clock className="w-5 h-5 mr-2 text-gray-600" />
                                                        <p className="text-sm">Opening hours</p>
                                                        {isHoursExpanded ? (
                                                            <ChevronUp className="w-4 h-4 ml-2 text-gray-600" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 ml-2 text-gray-600" />
                                                        )}
                                                    </div>
                                                    {isHoursExpanded && (
                                                        <ul className="text-sm text-gray-600 mt-1 ml-7 flex flex-col gap-3">
                                                            {selectedPlace.openingHours.map((hours, index) => (
                                                                <li key={index}>{hours}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {selectedPlace.phone && (
                                        <div className="flex items-center">
                                            <Phone className="w-5 h-5 mr-2 text-gray-600" />
                                            <span className="text-sm">{selectedPlace.phone}</span>
                                        </div>
                                    )}
                                    {selectedPlace.website && (
                                        <div className="mb-5 flex items-center">
                                            <Globe className="w-5 h-5 mr-2 text-gray-600" />
                                            <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                                                <span className="text-sm">{selectedPlace.website}</span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="absolute top-0 left-0 w-full p-3 z-[1002]">
                            <div className="relative w-full">
                                <Input
                                    id="searchVenue"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onFocus={() => {
                                        if (searchQuery.trim() !== "") filterPlaces(searchQuery);
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => setShowSuggestions(false), 100);
                                    }}
                                    placeholder="Search location..."
                                    className={`!text-[15px] w-full bg-white shadow-md border border-gray-300 py-5 px-4 pr-10 ${
                                        showSuggestions && filteredPlaces.length > 0 ? "rounded-t-xl rounded-b-none border-b-gray-200" : "rounded-full"
                                    }`}
                                    ref={inputRef}
                                    autoComplete="off"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                )}
                                {showSuggestions && filteredPlaces.length > 0 && (
                                    <div className="absolute left-0 w-full bg-white shadow-lg rounded-b-md border border-gray-300 border-t-0 z-[1003] max-h-[200px] overflow-y-auto custom-scroll suggestions-list">
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
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-4 right-4 flex justify-end space-x-2">
                        <Button variant="outline" onClick={handleClose} className="shadow-md">
                            Cancel
                        </Button>
                        <Button onClick={handleApply} className="shadow-md">
                            Apply
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}