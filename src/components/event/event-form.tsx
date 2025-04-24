"use client";

import { useState } from "react";
import EventInfoCard from "@/components/event/event-info-card";
import TicketsCard from "@/components/tickets/tickets-card";
import PromoCodesInfoCard from "@/components/promo-codes/promo-codes-card";
import NewsCard from "@/components/news/news-card";


type EventFormProps = {
    eventId: number;
};

export default function EventForm({ eventId }: EventFormProps) {
    const [editMode, setEditMode] = useState(false);

    return (
        <div className="flex flex-col items-center mt-7 bg-background">
            {/* Контейнер для всей формы с максимальной шириной */}
            <div className="w-full max-w-[1200px] flex flex-col gap-6">
                {/* Карточка события с фиксированными размерами */}
                <div className="flex sm:flex-row  w-full">
                    <EventInfoCard
                        editMode={editMode}
                        setEditMode={setEditMode}
                        eventId={eventId}
                    />
                </div>

                {/* Карточки билетов, промокодов и новостей в ряд */}
                <div className="flex flex-col sm:flex-row gap-6 w-full">
                    <div className="flex-1">
                        <TicketsCard eventId={eventId} />
                    </div>
                    <div className="flex-1">
                        <PromoCodesInfoCard eventId={eventId} />
                    </div>
                    <div className="flex-1">
                        <NewsCard eventId={eventId} />
                    </div>
                </div>
            </div>
        </div>
    );
}