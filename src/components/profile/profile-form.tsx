"use client";

import { useState } from "react";
import ProfileInfoCard from "@/components/profile/profile-info-card";
import CompanyCard from "@/components/company/company-card";
import OrdersCard from "@/components/order/orders-card";

export default function ProfileForm() {
    const [editMode, setEditMode] = useState(false);

    return (
        <div className="flex justify-center items-center mt-7 bg-background">
            <div className="flex flex-col md:flex-row gap-6 max-w-4xl w-full">
                {/* Карточка профиля */}
                <ProfileInfoCard editMode={editMode} setEditMode={setEditMode} />

                {/* Правая колонка с карточками */}
                <div className="flex flex-col gap-6 w-full md:w-1/2">
                    {/* Карточка компании */}
                    <CompanyCard />

                    {/* Карточка ордеров */}
                    <OrdersCard />
                </div>
            </div>
        </div>
    );
}