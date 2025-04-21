"use client";

import Image from "next/image";
import { CalendarDays, Guitar, MapPinned, Palette, Tag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getEvents } from "@/lib/event";
import { Event } from "@/types";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton"; // Импортируем наш кастомный Skeleton

const PopularCardsCarousel = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(1);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
    const isProcessingRef = useRef<boolean>(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true); // Состояние загрузки

    useEffect(() => {
        const fetchEvents = async () => {
            const start = Date.now();
            const response = await getEvents();
            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed; // Минимальная задержка 300 мс
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

    const popularEvents: Event[] = [...events]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 4);

    const totalSlides: number = popularEvents.length || 1;

    // Автоматическое переключение каждые 5 секунд
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (!isPaused && !isLoading) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => prevIndex + 1);
            }, 5000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused, isLoading]);

    // Плавный переход для бесконечной карусели
    const getTranslateX = (): string => {
        return `translateX(-${currentIndex * 100}%)`;
    };

    // Обработчики для кнопок с защитой от множественных кликов
    const handlePrev = (): void => {
        if (isProcessingRef.current || isLoading) return;
        isProcessingRef.current = true;
        setCurrentIndex((prevIndex) => prevIndex - 1);
        setTimeout(() => (isProcessingRef.current = false), 500);
    };

    const handleNext = (): void => {
        if (isProcessingRef.current || isLoading) return;
        isProcessingRef.current = true;
        setCurrentIndex((prevIndex) => prevIndex + 1);
        setTimeout(() => (isProcessingRef.current = false), 500);
    };

    // Обработчики наведения и ухода мыши
    const handleMouseEnter = (): void => {
        setIsPaused(true);
    };

    const handleMouseLeave = (): void => {
        setIsPaused(false);
    };

    // Обработчик клика по карточке
    const handleCardClick = (eventId: number) => {
        if (!isLoading) {
            router.push(`/products/${eventId}`);
        }
    };

    // Сброс позиции для бесконечного цикла
    useEffect(() => {
        if (currentIndex === totalSlides + 1) {
            setIsTransitioning(true);
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(1);
                setTimeout(() => setIsTransitioning(true), 50);
            }, 500);
            return () => clearTimeout(timeout);
        } else if (currentIndex === 0) {
            setIsTransitioning(true);
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(totalSlides);
                setTimeout(() => setIsTransitioning(true), 50);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, totalSlides]);

    // Нормализация индекса для индикаторов
    const getIndicatorIndex = (): number => {
        if (currentIndex === 0) return totalSlides - 1;
        if (currentIndex === totalSlides + 1) return 0;
        return currentIndex - 1;
    };


    if (isLoading) {
        return (
            <div className="px-custom w-full relative z-10">
                <div className="mt-4 overflow-hidden rounded-lg relative">
                    <div
                        className={`flex ${isTransitioning ? "transition-transform duration-500 ease-in-out" : ""}`}
                        style={{ transform: getTranslateX() }}
                    >
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={`skeleton-${index}`} className="w-full flex-shrink-0">
                                <Card className="w-full h-[400px] relative border-none">
                                    <Skeleton className="absolute inset-0 w-full h-full" />

                                </Card>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div
            className="px-custom w-full relative z-10"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="mt-4 overflow-hidden rounded-lg relative">
                <div
                    className={`flex ${isTransitioning ? "transition-transform duration-500 ease-in-out" : ""}`}
                    style={{ transform: getTranslateX() }}
                >
                    {popularEvents.length > 0 && (
                        <div key={`duplicate-last-${popularEvents[popularEvents.length - 1].id}`} className="w-full flex-shrink-0">
                            <Card
                                className="w-full h-[400px] relative border-none cursor-pointer"
                                onClick={() => handleCardClick(popularEvents[popularEvents.length - 1].id)}
                            >
                                <img
                                    src={
                                        popularEvents[popularEvents.length - 1].posterName
                                            ? `http://localhost:8080/uploads/event-posters/${popularEvents[popularEvents.length - 1].posterName}`
                                            : "https://via.placeholder.com/300x192"
                                    }
                                    alt={popularEvents[popularEvents.length - 1].title}
                                    className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-65 transition-all duration-300"
                                />
                                <CardContent className="relative h-full flex items-center justify-between p-8">
                                    <div className="flex flex-col gap-3 text-white max-w-[50%]">
                                        <h3 className="text-2xl font-bold">
                                            {popularEvents[popularEvents.length - 1].title}
                                        </h3>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-base flex items-center gap-1.5">
                                                <Tag strokeWidth={2.5} className="w-4 h-4 flex-shrink-0"/>
                                                <span className="truncate">
                                                    {popularEvents[popularEvents.length - 1].format.title} • {popularEvents[popularEvents.length - 1].themes.map((theme) => theme.title).join(", ")}
                                                </span>
                                            </p>
                                            <p className="text-base flex items-center gap-1.5">
                                                <CalendarDays strokeWidth={2} className="w-4 h-4 text-white" />{" "}
                                                {format(new Date(popularEvents[popularEvents.length - 1].startedAt), "MMMM d, yyyy HH:mm")}
                                            </p>
                                            <p className="text-base flex items-center gap-1.5">
                                                <MapPinned strokeWidth={2} className="w-4 h-4 text-white" />{" "}
                                                <span className="truncate">{popularEvents[popularEvents.length - 1].venue}</span>
                                            </p>
                                        </div>
                                        <p className="text-xl font-semibold">
                                            {(popularEvents[popularEvents.length - 1].id * 10).toFixed(2)} -{" "}
                                            {(popularEvents[popularEvents.length - 1].id * 20).toFixed(2)} $
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {popularEvents.map((event) => (
                        <div key={`original-${event.id}`} className="w-full flex-shrink-0">
                            <Card
                                className="w-full h-[400px] relative border-none cursor-pointer group"
                                onClick={() => handleCardClick(event.id)}
                            >
                                <img
                                    src={
                                        event.posterName
                                            ? `http://localhost:8080/uploads/event-posters/${event.posterName}`
                                            : "https://via.placeholder.com/300x192"
                                    }
                                    alt={event.title}
                                    className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-65 transition-all duration-300"
                                />
                                <CardContent className="relative h-full flex items-center justify-between p-8">
                                    <div className="flex flex-col gap-3 text-white max-w-[50%]">
                                        <h3 className="text-2xl font-bold">{event.title}</h3>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-base flex items-center gap-1.5">
                                                <Tag strokeWidth={2.5} className="w-4 h-4 flex-shrink-0"/>
                                                <span className="truncate">
                                                    {event.format.title} • {event.themes.map((theme) => theme.title).join(", ")}
                                                </span>
                                            </p>
                                            <p className="text-base flex items-center gap-1.5">
                                                <CalendarDays strokeWidth={2} className="w-4 h-4 text-white" />{" "}
                                                {format(new Date(event.startedAt), "MMMM d, yyyy HH:mm")}
                                            </p>
                                            <p className="text-base flex items-center gap-1.5">
                                                <MapPinned strokeWidth={2} className="w-4 h-4 text-white" />{" "}
                                                <span className="truncate">{event.venue}</span>
                                            </p>
                                        </div>
                                        <p className="text-xl font-semibold">
                                            {(event.id * 10).toFixed(2)} - {(event.id * 20).toFixed(2)} $
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                    {popularEvents.length > 0 && (
                        <div key={`duplicate-first-${popularEvents[0].id}`} className="w-full flex-shrink-0">
                            <Card
                                className="w-full h-[400px] relative border-none cursor-pointer"
                                onClick={() => handleCardClick(popularEvents[0].id)}
                            >
                                <img
                                    src={
                                        popularEvents[0].posterName
                                            ? `http://localhost:8080/uploads/event-posters/${popularEvents[0].posterName}`
                                            : "https://via.placeholder.com/300x192"
                                    }
                                    alt={popularEvents[0].title}
                                    className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-65 transition-all duration-300"
                                />
                                <CardContent className="relative h-full flex items-center justify-between p-8">
                                    <div className="flex flex-col gap-3 text-white max-w-[50%]">
                                        <h3 className="text-2xl font-bold">{popularEvents[0].title}</h3>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-base flex items-center gap-1.5">
                                                <Tag strokeWidth={2.5} className="w-4 h-4 flex-shrink-0"/>
                                                <span className="truncate">
                                                    {popularEvents[0].format.title} • {popularEvents[0].themes.map((theme) => theme.title).join(", ")}
                                                </span>
                                            </p>
                                            <p className="text-base flex items-center gap-1.5">
                                                <CalendarDays strokeWidth={2} className="w-4 h-4 text-white" />{" "}
                                                {format(new Date(popularEvents[0].startedAt), "MMMM d, yyyy HH:mm")}
                                            </p>
                                            <p className="text-base flex items-center gap-1.5">
                                                <MapPinned strokeWidth={2} className="w-4 h-4 text-white" />{" "}
                                                <span className="truncate">{popularEvents[0].venue}</span>
                                            </p>
                                        </div>
                                        <p className="text-xl font-semibold">
                                            {(popularEvents[0].id * 10).toFixed(2)} - {(popularEvents[0].id * 20).toFixed(2)} $
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
                <div className="cursor-pointer absolute right-13 bottom-15 flex flex-row gap-2 z-20">
                    <Button
                        onClick={handlePrev}
                        variant="outline"
                        className="cursor-pointer border-none bg-background/10 hover:bg-background/15"
                    >
                        <ChevronLeft strokeWidth={3} className="w-6 h-6 text-white" />
                    </Button>
                    <Button
                        onClick={handleNext}
                        variant="outline"
                        className="cursor-pointer border-none bg-background/10 hover:bg-background/15"
                    >
                        <ChevronRight strokeWidth={3} className="w-6 h-6 text-white" />
                    </Button>
                </div>
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                {popularEvents.map((_, index) => (
                    <div
                        key={index}
                        className={`w-6 h-1 rounded ${
                            getIndicatorIndex() === index ? "bg-red-500" : "bg-gray-400"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default PopularCardsCarousel;