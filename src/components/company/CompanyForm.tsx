"use client";

import { useState } from "react";
import EventsCard from "@/components/company/EventsCard";
import TicketsCard from "@/components/profile/TicketsCard";
import CompanyInfoCard from "@/components/company/CompanyInfoCard";
import NewsInfoCard from "@/components/news/news-info-card";


type ProfileFormProps = {
    companyId: number;
};

export default function ProfileForm({ companyId }: ProfileFormProps) {
    const [editMode, setEditMode] = useState(false);

    return (
        <div className="flex justify-center items-center mt-7 bg-background ">
            <div className="flex flex-col md:flex-row gap-6 max-w-4xl w-full">
                {/* Карточка профиля */}
                <CompanyInfoCard
                    editMode={editMode}
                    setEditMode={setEditMode}
                    companyId={companyId}
                />

                {/* Правая колонка с карточками */}
                <div className="flex flex-col gap-6 w-full md:w-1/2">
                    {/* Карточка компании */}
                    <EventsCard companyId={companyId}/>

                    <NewsInfoCard companyId={companyId} />
                </div>
            </div>
        </div>
    );
}