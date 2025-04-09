import Image from "next/image";
import { MapPin, User } from "lucide-react";
import LogoImage from "@/assets/logo_white.png";
import NotificationsBlock from "@/components/notification/NotificationsBlock";

export default async function CompanyPage({ params }: { params: Promise<{ companyId: string }> }) {
    const resolvedParams = await params;
    const companyId = resolvedParams.companyId;

    // Пример данных компании (в реальном проекте это может быть запрос к API)
    const companyData = {
        id: companyId,
        name: "Eventify Inc.",
        description: "Eventify Inc. is a leading company in organizing unforgettable events, concerts, and cultural experiences across the globe.",
        location: "123 Creative Street, Lviv, Ukraine",
        owner: "John Doe",
        image: LogoImage.src,
        notifications: [
            {
                title: "Company Schedule Updated",
                description: "We’ve updated the schedule for Event ${id}.",
                date: "March 10th, 2025",
            },
            {
                title: "Special Guest Announced",
                description: "We’re excited to announce a special guest for Event ${id}! Join us to meet a famous artist.",
                date: "March 5th, 2025",
            },
            {
                title: "Early Bird Tickets Sold Out",
                description: "Early bird tickets for Event ${id} are sold out. Regular tickets are still available!",
                date: "March 1st, 2025",
            },
        ],
    };

    return (
        <div className="px-custom py-4 w-full">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Изображение */}
                <div className="shrink-0 w-full md:w-96">
                    <Image
                        src={LogoImage}
                        alt={companyData.name}
                        width={384}
                        height={384}
                        className="h-96 w-full object-contain"
                    />
                </div>

                {/* Информация о компании */}
                <div className="px-6 flex-1 flex flex-col gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">{companyData.name}</h1>
                    <div className="flex flex-col gap-3 text-gray-700">
                        {/* Местоположение */}
                        <div className="flex items-center gap-2">
                            <MapPin strokeWidth={2.5} className="w-5 h-5 text-gray-500" />
                            <span className="text-lg font-medium">{companyData.location}</span>
                        </div>
                        {/* Владелец */}
                        <div className="flex items-center gap-2">
                            <User strokeWidth={2.5} className="w-5 h-5 text-gray-500" />
                            <span className="text-lg font-medium">Owner: {companyData.owner}</span>
                        </div>
                    </div>
                </div>
            </div>
            <NotificationsBlock notifications={companyData.notifications} />
            {/* Описание компании */}
            <div className="mt-8 border-t">
                <p className="mb-2 my-6 text-gray-600 text-lg leading-relaxed">
                    {companyData.description}
                </p>
            </div>
        </div>
    );
}