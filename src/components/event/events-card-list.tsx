// EventsCardList.tsx
"use client";

import { useSearchParams } from "next/navigation";
import EventCard from "./event-card";
import { Event } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import CustomPagination from "@/components/pagination/custom-pagination";

interface EventsCardListProps {
    events: Event[];
    totalCount: number;
    isLoading: boolean;
}

const EventsCardList = ({ events, totalCount, isLoading }: EventsCardListProps) => {
    const searchParams = useSearchParams();
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const take = 12;

    if (isLoading) {
        return (
            <div className="px-custom p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="w-full" style={{ maxWidth: "320px" }}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                {events.length > 0 ? (
                    events.map((event) => (
                        <div key={event.id} className="w-full" style={{ maxWidth: "320px" }}>
                            <EventCard event={event} />
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full text-center">No events found.</p>
                )}
            </div>

            <CustomPagination totalCount={totalCount} currentPage={page} take={take} maxVisiblePages={5} />
        </div>
    );
};

export default EventsCardList;