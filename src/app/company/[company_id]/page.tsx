import Image from "next/image";
import { Mail } from "lucide-react";
import { getCompanyById, getCompanyNewsById } from "@/lib/company";
import NotificationsBlock from "@/components/notification/notifications-block";
import {Button} from "@/components/ui/button";

interface CompanyNewsNotification {
    type: "companyNews";
    title: string;
    description: string;
    createdAt: string;
}

interface EventNotification {
    type: "event";
    title: string;
    createdAt: string;
    avatarUrl: string;
}

export default async function CompanyPage({ params }: { params: Promise<{ company_id: string }> }) {
    const resolvedParams = await params;
    const companyId = parseInt(resolvedParams.company_id, 10);

    if (isNaN(companyId) || companyId < 1) {
        return <div className="px-custom py-4">Company not found</div>;
    }

    const companyResponse = await getCompanyById(companyId);
    if (!companyResponse.success || !companyResponse.data) {
        return <div className="px-custom py-4">Company not found: {companyResponse.errors}</div>;
    }

    const newsResponse = await getCompanyNewsById(companyId);
    const rawCompanyNews = newsResponse.success && newsResponse.data ? newsResponse.data : [];

    const companyNewsNotifications: CompanyNewsNotification[] = rawCompanyNews.map((news) => ({
        type: "companyNews" as const,
        title: news.title,
        description: news.description,
        createdAt: news.createdAt,
    }));

    const rawEventNotifications = [
        {
            id: 1,
            title: "John",
            createdAt: "2025-04-15T10:07:28.000Z",
            avatarUrl: `http://localhost:8080/uploads/event-posters/default-poster.png`,
        },
        {
            id: 2,
            title: "Jane",
            createdAt: "2025-04-15T10:08:00.000Z",
            avatarUrl: `http://localhost:8080/uploads/event-posters/default-poster.png`,
        },
        {
            id: 1,
            title: "John",
            createdAt: "2025-04-15T10:07:28.000Z",
            avatarUrl: `http://localhost:8080/uploads/event-posters/default-poster.png`,
        },
    ];

    const eventNotifications: EventNotification[] = rawEventNotifications.map((event) => ({
        type: "event" as const,
        title: event.title,
        createdAt: event.createdAt,
        avatarUrl: event.avatarUrl,
    }));

    const company = companyResponse.data;

    // Формируем URL изображения компании
    const imageUrl = company.logoName
        ? `http://localhost:8080/uploads/company-logos/${company.logoName}` // Предполагаемый путь к логотипу
        : "https://via.placeholder.com/384x384"; // Запасное изображение

    return (
        <div className="px-custom py-4 w-full">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Изображение */}
                <div className="shrink-0 w-full md:w-96">
                    <Image
                        src={imageUrl}
                        alt={company.title}
                        width={384}
                        height={384}
                        className="h-96 w-full object-contain"
                    />
                </div>

                {/* Информация о компании */}
                <div className="px-6 flex-1 flex flex-col gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">{company.title}</h1>
                    <div className="flex flex-col gap-3 text-gray-700">
                        {/* Email */}
                        <div className="flex items-center gap-2">
                            <Mail strokeWidth={2.5} className="w-5 h-5 text-gray-500" />
                            <span className="text-lg font-medium">{company.email}</span>
                        </div>
                        <Button
                            variant="outline"
                            className="text-[16px] py-5 px-7 rounded-full font-medium mt-1 w-[300px]"
                        >
                            Subscribe to event notifications
                        </Button>
                        <div className="-mt-3 flex flex-wrap gap-2">
                            <div className="flex-1 min-w-[300px] md:flex-[2]">
                                <NotificationsBlock notifications={eventNotifications} />
                            </div>
                            <div className="flex-1 min-w-[300px] md:flex-[4]">
                                <NotificationsBlock notifications={companyNewsNotifications} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Описание компании */}
            <div className="mt-8 border-t">
                <p className="mb-2 my-6 text-gray-600 text-lg leading-relaxed">
                    {company.description}
                </p>
            </div>
        </div>
    );
}