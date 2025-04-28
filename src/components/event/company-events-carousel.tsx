"use client";

import { useState, useEffect, useRef } from "react";
import { getCompanyEvents } from "@/lib/companies";
import { Event, CompanyEventsCarouselProps } from "@/types/event";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/event/event-card";

const EventsCompanyCarousel = ({ companyId }: CompanyEventsCarouselProps) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [hasMoved, setHasMoved] = useState<boolean>(false); // Отслеживаем, было ли перемещение
    const carouselRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef<boolean>(false);
    const startXRef = useRef<number>(0);
    const scrollLeftRef = useRef<number>(0);
    const autoScrollDirectionRef = useRef<"right" | "left">("right");
    const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            const start = Date.now();
            const response = await getCompanyEvents(companyId);
            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            if (response.success && response.data) {
                setEvents(response.data.slice(0, 6));
            } else {
                console.error(`Failed to fetch events for company ${companyId}:`, response);
                setEvents([]);
            }
            setIsLoading(false);
        };
        fetchEvents();
    }, [companyId]);

    // Функция для запуска автоматической прокрутки
    const startAutoScroll = () => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
        }

        autoScrollIntervalRef.current = setInterval(() => {
            if (!carouselRef.current) return;

            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            const maxScrollLeft = scrollWidth - clientWidth;

            if (autoScrollDirectionRef.current === "right") {
                carouselRef.current.scrollLeft += 0.5; // Замедляем прокрутку (0.5 пикселя за шаг)
                if (scrollLeft + clientWidth >= scrollWidth - 1) {
                    // Достигли правого конца, останавливаем прокрутку
                    if (autoScrollIntervalRef.current) {
                        clearInterval(autoScrollIntervalRef.current);
                    }
                    // Ждем 2 секунды перед сменой направления
                    setTimeout(() => {
                        autoScrollDirectionRef.current = "left";
                        startAutoScroll(); // Возобновляем прокрутку
                    }, 2000);
                }
            } else {
                carouselRef.current.scrollLeft -= 0.5; // Замедляем прокрутку (0.5 пикселя за шаг)
                if (scrollLeft <= 1) {
                    // Достигли левого конца, останавливаем прокрутку
                    if (autoScrollIntervalRef.current) {
                        clearInterval(autoScrollIntervalRef.current);
                    }
                    // Ждем 2 секунды перед сменой направления
                    setTimeout(() => {
                        autoScrollDirectionRef.current = "right";
                        startAutoScroll(); // Возобновляем прокрутку
                    }, 2000);
                }
            }
        }, 16); // ~60 FPS (1000ms / 60 ≈ 16ms)
    };

    // Запускаем автоматическую прокрутку, если ивентов больше 4
    useEffect(() => {
        if (events.length <= 4 || !carouselRef.current) return;

        startAutoScroll();

        return () => {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current);
            }
        };
    }, [events]);

    // Обработчики для перетаскивания
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!carouselRef.current) return;
        isDraggingRef.current = true;
        setIsDragging(true);
        setHasMoved(false); // Сбрасываем состояние перемещения
        startXRef.current = e.pageX - carouselRef.current.offsetLeft;
        scrollLeftRef.current = carouselRef.current.scrollLeft;

        // Останавливаем автоматическую прокрутку во время перетаскивания
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !carouselRef.current) return;
        e.preventDefault();
        const x = e.pageX - carouselRef.current.offsetLeft;
        const walk = (x - startXRef.current) * 1; // Скорость перетаскивания
        carouselRef.current.scrollLeft = scrollLeftRef.current - walk;

        // Если перемещение больше порога (20 пикселей), считаем это перетаскиванием
        if (Math.abs(x - startXRef.current) > 5) {
            setHasMoved(true);
        }
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
    };

    const handleMouseEnter = () => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
        }
    };

    const handleMouseLeaveCarousel = () => {
        if (isDraggingRef.current) {
            handleMouseUp();
        }
        if (events.length > 4 && carouselRef.current) {
            startAutoScroll();
        }
    };

    // Блокируем событие click на карточке, если было перетаскивание
    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (hasMoved) {
            e.preventDefault();
            e.stopPropagation(); // Предотвращаем вызов onClick на Card
        }
        setHasMoved(false); // Сбрасываем hasMoved после клика
    };

    if (isLoading) {
        return (
            <div className="w-full relative z-10 mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">More Events from This Company</h2>
                <div className="overflow-hidden rounded-lg relative">
                    <div className="flex">
                        {Array.from({ length: Math.min(6, events.length || 1) }).map((_, index) => (
                            <div key={`skeleton-${index}`} className="w-full sm:w-1/2 md:w-1/3 lg:w-[22.5%] flex-shrink-0">
                                <div className="w-full h-[300px]">
                                    <Skeleton className="w-full h-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return null;
    }

    return (
        <div className="w-full relative z-10 mt-8">
            <div className="flex flex-row justify-between items-center w-full">
                <h2 className="text-2xl font-bold text-gray-800">More Events from This Company</h2>
            </div>
            <div
                className="overflow-hidden rounded-lg relative custom-scroll"
                ref={carouselRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeaveCarousel}
                onDragStart={(e) => e.preventDefault()}
                style={{

                    whiteSpace: "nowrap",
                    cursor: "grab",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                }}
            >
                <div className="flex" style={{ paddingTop: "10px" }}>
                    {events.map((event) => (
                        <div
                            key={`original-${event.id}`}
                            className="w-full sm:w-1/2 md:w-1/3 lg:w-[22.5%] flex-shrink-0 inline-block"
                            style={{ transform: "scale(0.9)", transformOrigin: "left" }}
                            onClick={handleCardClick}
                        >
                            <EventCard event={event} hasMoved={hasMoved} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EventsCompanyCarousel;