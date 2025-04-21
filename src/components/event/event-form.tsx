"use client";

import { useState } from "react";
import EventInfoCard from "@/components/event/event-info-card";
import TicketsInfoCard from "@/components/tickets/tickets-info-card";
import PromoCodesInfoCard from "@/components/promocodes/promo-codes-info-card";
import NewsInfoCard from "@/components/news/news-info-card";


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
                <div className="w-[1200px] h-[600px]">
                    <EventInfoCard
                        editMode={editMode}
                        setEditMode={setEditMode}
                        eventId={eventId}
                    />
                </div>

                {/* Карточки билетов, промокодов и новостей в ряд */}
                <div className="flex flex-col sm:flex-row gap-6 w-full">
                    <div className="flex-1">
                        <TicketsInfoCard companyId={eventId} />
                    </div>
                    <div className="flex-1">
                        <PromoCodesInfoCard companyId={eventId} />
                    </div>
                    <div className="flex-1">
                        <NewsInfoCard companyId={eventId} />
                    </div>
                </div>
            </div>
        </div>
    );
}