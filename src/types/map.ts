export interface LocationPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (venue: string, coordinates: string) => void;
    initialVenue: string;
    initialCoordinates: string;
}

export interface PlaceDetails {
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

export interface MapEmbedProps {
    coordinates: string;
}