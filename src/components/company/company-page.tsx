"use client";

import Image from "next/image";
import { Mail } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import AttendeesAndNewsBlock from "@/components/attendees-and-news/attendees-and-news-block";
import SubscriptionActions from "@/components/subscriptions/subscription-actions";
import { Company, CompanyNewsNotification, EventNotification } from "@/types/company";

interface CompanyPageProps {
    data:
        | {
        company: Company;
        companyNewsNotifications: CompanyNewsNotification[];
        eventNotifications: EventNotification[];
    }
        | { error: string };
}

export default function CompanyPage({ data }: CompanyPageProps) {
    const { user } = useAuth();

    if ("error" in data) {
        return <div className="px-custom py-4">{data.error}</div>;
    }

    if (!user) {
        return;
    }

    const { company, companyNewsNotifications, eventNotifications } = data;

    const imageUrl = company.logoName
        ? `http://localhost:8080/uploads/company-logos/${company.logoName}`
        : "https://via.placeholder.com/384x384";

    return (
        <div className="px-custom py-4 w-full">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="shrink-0 w-full md:w-96">
                    <Image
                        src={imageUrl}
                        alt={company.title}
                        width={384}
                        height={384}
                        className="h-96 w-full object-contain"
                    />
                </div>

                <div className="px-6 flex-1 flex flex-col gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">{company.title}</h1>
                    <div className="flex flex-col gap-3 text-gray-700">
                        <div className="flex items-center gap-2">
                            <Mail strokeWidth={2.5} className="w-5 h-5 text-gray-500" />
                            <span className="text-lg font-medium">{company.email}</span>
                        </div>
                        <SubscriptionActions
                            title={company.title}
                            entityId={company.id}
                            userId={user?.id}
                            isCompanyPage={true}
                        />
                        <div className="-mt-3 flex flex-wrap gap-2">
                            <div className="flex-1 min-w-[300px] md:flex-[2]">
                                <AttendeesAndNewsBlock notifications={eventNotifications} />
                            </div>
                            <div className="flex-1 min-w-[300px] md:flex-[4]">
                                <AttendeesAndNewsBlock notifications={companyNewsNotifications} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 border-t">
                <p className="mb-2 my-6 text-gray-600 text-lg leading-relaxed">{company.description}</p>
            </div>
        </div>
    );
}