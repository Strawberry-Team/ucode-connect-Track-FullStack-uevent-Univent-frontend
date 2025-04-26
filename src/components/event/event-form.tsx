"use client";

import { useState } from "react";
import EventInfoCard from "@/components/event/event-info-card";
import TicketsCard from "@/components/ticket/tickets-card";
import PromoCodesInfoCard from "@/components/promo-codes/promo-codes-card";
import NewsCard from "@/components/news/news-card";


type EventFormProps = {
    eventId: number;
};

export default function EventForm({ eventId }: EventFormProps) {
    const [editMode, setEditMode] = useState(false);

    return (
        <div className="flex flex-col items-center mt-7 bg-background">
            <div className="w-full max-w-[1200px] flex flex-col gap-6">
                <div className="flex sm:flex-row  w-full">
                    <EventInfoCard
                        editMode={editMode}
                        setEditMode={setEditMode}
                        eventId={eventId}
                    />
                </div>

                <div className="flex flex-col md:flex-row md:flex-wrap !lg:flex-nowrap gap-6 w-full">
                    <div className="flex-1 !min-w-[350px] lg:min-w-0">
                        <TicketsCard eventId={eventId} />
                    </div>
                    <div className="flex-1 !min-w-[360px] lg:min-w-0">
                        <PromoCodesInfoCard eventId={eventId} />
                    </div>
                    <div className="flex-1 !min-w-[350px] lg:min-w-0">
                        <NewsCard eventId={eventId} />
                    </div>
                </div>
            </div>
        </div>
    );
}