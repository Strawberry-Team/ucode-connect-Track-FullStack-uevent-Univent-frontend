"use client";

import { useState } from "react";
import ProfileCard from "@/components/profile/ProfileCard";
import CompanyCard from "@/components/profile/CompanyCard";
import TicketsCard from "@/components/profile/TicketsCard";

type Ticket = {
    id: number;
    name: string;
    status: string;
};

type Company = {
    name: string;
    status: string;
} | null;

type ProfileFormProps = {
    initialCompany: Company;
    initialTickets: Ticket[];
};

export default function ProfileForm({ initialCompany, initialTickets }: ProfileFormProps) {
    const [editMode, setEditMode] = useState(false);

    return (
        <div className="flex justify-center items-start bg-background overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 max-w-4xl w-full">
                {/* Карточка профиля */}
                <ProfileCard editMode={editMode} setEditMode={setEditMode} />

                {/* Правая колонка с карточками */}
                <div className="flex flex-col gap-6 w-full md:w-1/2">
                    {/* Карточка компании */}
                    <CompanyCard initialCompany={initialCompany} />

                    {/* Карточка тикетов */}
                    <TicketsCard initialTickets={initialTickets} />
                </div>
            </div>
        </div>
    );
}