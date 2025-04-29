"use client";

import { useState, useEffect } from "react";
import { MapEmbedProps } from "@/types/map";

const parseCoordinates = (coords: string): { lat: number; lng: number } | null => {
    if (!coords) return null;
    const [lat, lng] = coords.split(",").map(Number);
    return isNaN(lat) || isNaN(lng) ? null : { lat, lng };
};

export default function GoogleMapIframe({ coordinates }: MapEmbedProps) {
    const [mapEmbedUrl, setMapEmbedUrl] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            setError("Google Maps API key is missing");
            return;
        }

        if (!coordinates) {
            setError("Coordinates are missing");
            return;
        }

        const coords = parseCoordinates(coordinates);
        if (!coords) {
            setError("Invalid coordinates format");
            return;
        }

        const { lat, lng } = coords;
        const centerLat = lat + 0.0005;
        const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&center=${centerLat},${lng}&zoom=15&language=en`;
        setMapEmbedUrl(embedUrl);

    }, [coordinates]);


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
                <div className="text-gray-600">
                    Loading map...
                </div>
            )}
        </>
    );
}