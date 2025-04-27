"use client";

import { useState, useEffect } from "react";
import FilterEvents from "@/components/filter/filter-events";
import EventsPopularCardCarousel from "@/components/event/events-popular-card-carousel";
import EventsCardList from "@/components/event/events-card-list";
import { getEvents } from "@/lib/event";
import { getEventFormats } from "@/lib/format";
import { getThemes } from "@/lib/theme";
import { Event, EventFormat, Theme } from "@/types";
import { useSearchParams } from "next/navigation";

export default function MainPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(100);
    const [formats, setFormats] = useState<EventFormat[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const searchParams = useSearchParams();
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const take = 12;
    const skip = (page - 1) * take;

    const formatsParam = searchParams.get("formats") || undefined;
    const themesParam = searchParams.get("themes") || undefined;
    const startDateRaw = searchParams.get("startedAt") || undefined;
    const endDateRaw = searchParams.get("endedAt") || undefined;
    const title = searchParams.get("title") || undefined;
    const minPriceParam = searchParams.get("minPrice") || undefined;
    const maxPriceParam = searchParams.get("maxPrice") || undefined;
    const sortByParam = searchParams.get("sortBy") || undefined; // Добавляем sortBy
    const sortOrderParam = searchParams.get("sortOrder") || undefined; // Добавляем sortOrder

    const startDate = startDateRaw ? new Date(startDateRaw).toISOString() : undefined;
    const endDate = endDateRaw
        ? new Date(new Date(endDateRaw).setHours(23, 59, 59, 999)).toISOString()
        : undefined;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const start = Date.now();

            // Запрос на форматы
            const formatsResponse = await getEventFormats();
            if (formatsResponse.success && formatsResponse.data) {
                setFormats(formatsResponse.data);
            } else {
                console.error("Failed to load formats:", formatsResponse.errors);
                setFormats([]);
            }

            // Запрос на темы
            const themesResponse = await getThemes();
            if (themesResponse.success && themesResponse.data) {
                setThemes(themesResponse.data);
            } else {
                console.error("Failed to load themes:", themesResponse.errors);
                setThemes([]);
            }

            // Запрос на события
            const response = await getEvents(
                skip,
                take,
                formatsParam,
                themesParam,
                startDate,
                endDate,
                title,
                minPriceParam ? Number(minPriceParam) : undefined,
                maxPriceParam ? Number(maxPriceParam) : undefined,
                sortByParam, // Передаём sortBy
                sortOrderParam // Передаём sortOrder
            );
            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            if (response.success && response.data?.items) {
                setEvents(response.data.items);
                setTotalCount(response.data.total);
                setMinPrice(response.data.minPrice || 0);
                setMaxPrice(response.data.maxPrice || 100);
            } else {
                console.error("Failed to fetch events or items are missing:", response);
                setEvents([]);
                setTotalCount(0);
                setMinPrice(0);
                setMaxPrice(100);
            }
            setIsLoading(false);
        };

        fetchData();
    }, [skip, take, formatsParam, themesParam, startDateRaw, endDateRaw, title, minPriceParam, maxPriceParam, sortByParam, sortOrderParam]); // Добавляем зависимости

    return (
        <div>
            <FilterEvents formats={formats} themes={themes} minPrice={minPrice} maxPrice={maxPrice} />
            <EventsPopularCardCarousel events={events} isLoading={isLoading} />
            <EventsCardList events={events} totalCount={totalCount} isLoading={isLoading} />
        </div>
    );
}