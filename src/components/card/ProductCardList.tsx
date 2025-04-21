"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { getEvents } from "@/lib/event";
import { Event } from "@/types";
import { Skeleton } from "@/components/ui/skeleton"; // Импортируем наш кастомный Skeleton

const ProductCardList = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Изменили начальное значение на true

    useEffect(() => {
        const fetchEvents = async () => {
            const start = Date.now();
            const response = await getEvents();
            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
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
        return (
            <div className="px-custom flex flex-wrap gap-6 p-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex-grow min-w-[270px] basis-[calc(25%-1.5rem)]"
                    >
                        <div className="cursor-pointer w-full bg-white flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-2xl">
                            <Skeleton className="h-48 w-full" />
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="mt-2">
                                    <Skeleton className="h-6 w-1/3" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
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