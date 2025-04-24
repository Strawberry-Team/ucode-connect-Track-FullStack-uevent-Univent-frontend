"use client";

import { useState } from "react";
import ProfileInfoCard from "@/components/profile/profile-info-card";
import CompanyCard from "@/components/company/company-card";
import OrdersCard from "@/components/profile/orders-card";

type Ticket = {
    id: number;
    name: string;
    status: string;
};

type ProfileFormProps = {
    initialTickets: Ticket[];
};

export default function ProfileForm({ initialTickets }: ProfileFormProps) {
    const [editMode, setEditMode] = useState(false);

    return (
        <div className="flex justify-center items-center mt-7 bg-background">
            <div className="flex flex-col md:flex-row gap-6 max-w-4xl w-full">
                {/* Карточка профиля */}
                <ProfileInfoCard editMode={editMode} setEditMode={setEditMode} />

                {/* Правая колонка с карточками */}
                <div className="flex flex-col gap-6 w-full md:w-1/2">
                    {/* Карточка компании */}
                    <CompanyCard  />

                    {/* Карточка тикетов */}
                    <OrdersCard initialTickets={initialTickets} />
                </div>
            </div>
        </div>
    );
}