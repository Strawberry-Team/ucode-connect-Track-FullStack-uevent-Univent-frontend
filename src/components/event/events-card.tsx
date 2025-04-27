// components/events-card.tsx
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedButton from "@/components/ui/animated-button";
import ManageEventModal from "@/components/event/event-create-modal";
import { Calendar, CalendarDays, Pencil, Plus } from "lucide-react";
import { getCompanyEvents } from "@/lib/company";
import { showErrorToasts } from "@/lib/toast";
import { Event } from "@/types";
import EventCreateModal from "@/components/event/event-create-modal";

type EventsCardProps = {
    companyId: number;
};

export default function EventsCard({ companyId }: EventsCardProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            const start = Date.now();
            const result = await getCompanyEvents(companyId);
            if (result.data !== undefined && result.data !== null) {
                const sortedEvents = result.data.sort(
                    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
                );
                setEvents(sortedEvents);
            } else {
                setEvents([]);
                showErrorToasts(result.errors);
            }
            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            setIsLoading(false);
        };
        fetchEvents();
    }, [companyId]);

    const handleEventCreated = (newEvent: Event) => {
        setEvents((prev) =>
            [...prev, newEvent].sort(
                (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
            )
        );
    };

    return (
        <>
            <Card className="flex h-[370px] flex-col shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                    <div className="-mt-2 flex items-center justify-between border-b pb-1 text-xl font-medium text-foreground">
                        <div className="flex items-center">
                            <Calendar strokeWidth={2.5} className="mr-2 h-5 w-5 text-gray-500" />
                            Events
                        </div>
                        {!isLoading && events.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setEditingEvent(null);
                                    setIsModalOpen(true);
                                }}
                            >
                                <div className="flex items-center gap-1 text-[15px]">
                                    <Plus strokeWidth={2.5} className="h-5 w-5" />
                                    Add event
                                </div>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="-mt-5 flex-1">
                    {isLoading ? (
                        <div className="max-h-[290px] overflow-y-auto px-3 pt-3 custom-scroll">
                            {Array.from({ length: 1 }).map((_, index) => (
                                <div key={index} className="flex flex-col">
                                    <div className="flex items-center justify-between rounded-lg px-2">
                                        <div className="flex items-center gap-4 rounded-lg py-2">
                                            <Skeleton className="h-11 w-11 rounded-md" />
                                            <div className="flex flex-col py-1">
                                                <Skeleton className="h-[20px] w-[150px]" />
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Skeleton className="h-[16px] w-[100px]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : events.length > 0 ? (
                        <div className="max-h-[290px] overflow-y-auto px-3 pt-3 custom-scroll">
                            {events.map((event, index) => (
                                <div key={event.id} className="flex flex-col">
                                    <div className="flex items-center justify-between rounded-lg px-2 transition-all duration-500 hover:shadow-[0_0_15px_rgba(0,0,0,0.15)] cursor-pointer">
                                        <Link href={`/events/${event.id}`} className="flex-1">
                                            <div className="flex items-center gap-4 rounded-lg py-1 transition-all">
                                                <img
                                                    src={
                                                        event.posterName
                                                            ? `http://localhost:8080/uploads/event-posters/${event.posterName}`
                                                            : "https://via.placeholder.com/200x200"
                                                    }
                                                    alt="Event poster"
                                                    className="h-11 w-11 rounded-md object-cover"
                                                />
                                                <div className="flex flex-col">
                                                    <h4
                                                        className="text-[20px] -mt-1 font-medium text-gray-800"
                                                        style={{
                                                            maxWidth: "200px",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                        }}
                                                    >
                                                        {event.title}
                                                    </h4>
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <CalendarDays strokeWidth={2.5} className="h-3 w-3" />
                                                        <span className="text-[12px]">
                                                            {format(new Date(event.startedAt), "MMMM d, yyyy")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                        <Link href={`/events/${event.id}/edit`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => e.stopPropagation()}
                                                className="h-10 w-10"
                                            >
                                                <Pencil strokeWidth={2.5} className="!h-5 !w-5" />
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="my-2">
                                        {index < events.length - 1 && <hr className="border-gray-200" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <AnimatedButton
                                title="Create event"
                                onClick={() => {
                                    setEditingEvent(null);
                                    setIsModalOpen(true);
                                }}
                                isClicked={isClicked}
                                setIsClicked={setIsClicked}
                                topLeftHover={{ left: 4.5, top: 6.4 }}
                                topRightHover={{ right: 4.5, top: 6.4 }}
                                bottomLeftHover={{ left: 4.5, bottom: 6.4 }}
                                bottomRightHover={{ right: 4.5, bottom: 6.4 }}
                                centerPadding={{ left: 4.5, top: 6.4, right: 4.5, bottom: 6.4 }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <EventCreateModal
                companyId={companyId}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsClicked(false);
                    setEditingEvent(null);
                }}
                onEventCreated={handleEventCreated}
            />
        </>
    );
}