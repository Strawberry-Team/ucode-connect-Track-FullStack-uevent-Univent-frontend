"use client";

import { useState } from "react";
import EventsCard from "@/components/event/events-card";
import OrdersCard from "@/components/profile/orders-card";
import CompanyInfoCard from "@/components/company/company-info-card";
import NewsCard from "@/components/news/news-card";


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

                    <NewsCard companyId={companyId} />
                </div>
            </div>
        </div>
    );
}