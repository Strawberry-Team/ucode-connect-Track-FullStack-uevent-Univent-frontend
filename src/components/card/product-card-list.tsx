"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./product-card";
import { getEvents } from "@/lib/event";
import { Event } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import CustomPagination from "@/components/pagination/custom-pagination";

const ProductCardList = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const take = 12;
    const skip = (page - 1) * take;

    // Извлекаем фильтры из query-параметров
    const formatId = searchParams.get("formatId") ? Number(searchParams.get("formatId")) : undefined;
    const themes = searchParams.get("themes") || undefined;

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            const start = Date.now();
            const response = await getEvents(skip, take, formatId, themes);
            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            if (response.success && response.data?.items) {
                setEvents(response.data.items);
                setTotalCount(response.data.total);
            } else {
                console.error("Failed to fetch events or items are missing:", response);
                setEvents([]);
                setTotalCount(0);
            }
            setIsLoading(false);
        };
        fetchEvents();
    }, [skip, take, formatId, themes]);

    if (isLoading) {
        return (
            <div className="px-custom p-4">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-6 justify-items-center">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="w-full min-w-[270px] max-w-[320px]"
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
            </div>
        );
    }

    return (
        <div className="px-custom flex flex-col gap-6 p-4">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-6 justify-items-center">
                {events.length > 0 ? (
                    events.map((event) => (
                        <div
                            key={event.id}
                            className="w-full min-w-[270px] max-w-[420px]"
                        >
                            <ProductCard event={event} />
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full text-center">No events found.</p>
                )}
            </div>

            <CustomPagination
                totalCount={totalCount}
                currentPage={page}
                take={take}
                maxVisiblePages={5}
            />
        </div>
    );
};

export default ProductCardList;