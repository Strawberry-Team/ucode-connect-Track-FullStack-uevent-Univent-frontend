"use client";

import { useState, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

interface MapEmbedProps {
    coordinates: string;
}

const parseCoordinates = (coords: string): { lat: number; lng: number } | null => {
    if (!coords) return null;
    const [lat, lng] = coords.split(",").map(Number);
    return isNaN(lat) || isNaN(lng) ? null : { lat, lng };
};

export default function GoogleMapIframe({ coordinates }: MapEmbedProps) {
    const [mapEmbedUrl, setMapEmbedUrl] = useState<string>("");

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE",
        libraries: ["places"],
    });

    useEffect(() => {
        if (isLoaded && coordinates) {
            const coords = parseCoordinates(coordinates);
            if (coords) {
                const { lat, lng } = coords;
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
                        const placeId = results[0].place_id;
                        const centerLat = lat + 0.0005;
                        const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=place_id:${placeId}&center=${centerLat},${lng}&zoom=15&language=en`;
                        setMapEmbedUrl(embedUrl);
                    } else {
                        const centerLat = lat + 0.0005;
                        const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${lat},${lng}&center=${centerLat},${lng}&zoom=15&language=en`;
                        setMapEmbedUrl(embedUrl);
                    }
                });
            } else {
                setMapEmbedUrl("");
            }
        }
    }, [isLoaded, coordinates]);

    return (
        <>
            {mapEmbedUrl ? (
                <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="300"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="md:w-[500px] rounded-lg md:float-right md:ml-6"
                />
            ) : (
                <div>
                </div>
            )}
        </>
    );
}