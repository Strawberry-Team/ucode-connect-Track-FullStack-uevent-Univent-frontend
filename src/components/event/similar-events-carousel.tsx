"use client";

import { useState, useEffect, useRef } from "react";
import { getEvents } from "@/lib/events";
import {Event, SimilarEventsCarouselProps} from "@/types/event";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/event/event-card";

const SimilarEventsCarousel = ({ currentEventId, themes }: SimilarEventsCarouselProps) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [hasMoved, setHasMoved] = useState<boolean>(false);
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
            const response = await getEvents(undefined, undefined, undefined, themes);
            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            if (response.success && response.data?.items) {
                const filteredEvents = response.data.items.filter(
                    (event) => event.id !== currentEventId
                );
                setEvents(filteredEvents);
            } else {
                console.error(`Failed to fetch similar events:`, response);
                setEvents([]);
            }
            setIsLoading(false);
        };
        fetchEvents();
    }, [currentEventId, themes]);

    const startAutoScroll = () => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
        }

        autoScrollIntervalRef.current = setInterval(() => {
            if (!carouselRef.current) return;

            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            if (autoScrollDirectionRef.current === "right") {
                carouselRef.current.scrollLeft += 0.5;
                if (scrollLeft + clientWidth >= scrollWidth - 1) {
                    if (autoScrollIntervalRef.current) {
                        clearInterval(autoScrollIntervalRef.current);
                    }
                    setTimeout(() => {
                        autoScrollDirectionRef.current = "left";
                        startAutoScroll();
                    }, 2000);
                }
            } else {
                carouselRef.current.scrollLeft -= 0.5;
                if (scrollLeft <= 1) {
                    if (autoScrollIntervalRef.current) {
                        clearInterval(autoScrollIntervalRef.current);
                    }
                    setTimeout(() => {
                        autoScrollDirectionRef.current = "right";
                        startAutoScroll();
                    }, 2000);
                }
            }
        }, 16);
    };

    useEffect(() => {
        if (events.length <= 1 || !carouselRef.current) return;

        startAutoScroll();

        return () => {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current);
            }
        };
    }, [events]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!carouselRef.current) return;
        isDraggingRef.current = true;
        setIsDragging(true);
        setHasMoved(false);
        startXRef.current = e.pageX - carouselRef.current.offsetLeft;
        scrollLeftRef.current = carouselRef.current.scrollLeft;

        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !carouselRef.current) return;
        e.preventDefault();
        const x = e.pageX - carouselRef.current.offsetLeft;
        const walk = (x - startXRef.current) * 1;
        carouselRef.current.scrollLeft = scrollLeftRef.current - walk;

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

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (hasMoved) {
            e.preventDefault();
            e.stopPropagation();
        }
        setHasMoved(false);
    };

    if (isLoading) {
        return (
            <div className="w-full relative z-10 mt-5">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Similar Events</h2>
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
        <div className="w-full relative z-10 mt-5">
            <div className="flex flex-row justify-between items-center w-full">
                <h2 className="text-2xl font-bold text-gray-800">Similar Events</h2>
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
                <div className="flex pb-8" >
                    {events.map((event) => (
                        <div
                            key={`similar-${event.id}`}
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

export default SimilarEventsCarousel;