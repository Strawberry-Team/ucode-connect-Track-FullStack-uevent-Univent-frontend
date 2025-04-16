"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { getEvents, Event } from "@/lib/event";

const ProductCardList = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            const response = await getEvents();
            if (response.success && response.data) {
                setEvents(response.data);
            } else {
                setEvents([]);
            }
            setIsLoading(false);
        };
        fetchEvents();
    }, []);

    if (isLoading) {
        return <div className="px-custom p-4">Loading events...</div>;
    }

    if (events.length === 0) {
        return <div className="px-custom p-4">No events available.</div>;
    }

    return (
        <div className="px-custom flex flex-wrap gap-6 p-4">
            {events.map((event) => (
                <div
                    key={event.id}
                    className="flex-grow min-w-[270px] basis-[calc(25%-1.5rem)]"
                >
                    <ProductCard event={event} />
                </div>
            ))}
        </div>
    );
};

export default ProductCardList;