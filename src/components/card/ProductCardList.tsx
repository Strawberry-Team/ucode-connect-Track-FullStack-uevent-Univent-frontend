"use client";

import ProductCard from "./ProductCard";
import { useEventsStore } from "@/store/eventsStore";
import { useEffect } from "react";

const ProductCardList = () => {
    const { events, isLoading, fetchEvents } = useEventsStore();

    useEffect(() => {
        // Загружаем события, если их нет или если прошло больше 5 минут
        const shouldFetch =
            events.length === 0 ||
            !useEventsStore.getState().lastFetched ||
            (useEventsStore.getState().lastFetched &&
                Date.now() - useEventsStore.getState().lastFetched > 5 * 60 * 1000);

        if (shouldFetch) {
            fetchEvents();
            console.log("Загрузка");
        }
    }, [fetchEvents]);

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