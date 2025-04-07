import Image from "next/image";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
    CalendarDays,
    MapPinned,
    MapPin,
    Tag,
    Palette,
    Building,
} from "lucide-react";
import LogoImage from "@/assets/logo_white.png";
import TicketActions from "@/components/card/TicketActions";

export default async function PageCard({params}: { params: Promise<{ product: string }> }) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.product, 10);

    // Пример данных (в реальном проекте это может быть запрос к API)
    const ticketData = {
        title: `Event ${id}`,
        description: `Join us for an amazing event! This is a detailed description of the event with ID ${id}. We’ll have a great time together, with lots of activities and fun.`,
        location: "Lviv Opera House",
        locationLink: "https://maps.google.com/?q=Lviv+Opera+House", // Ссылка на Google Maps
        dateStart: "March 16th, 2025, 10:00",
        dateEnd: "March 16th, 2025, 14:00",
        format: "Concert",
        themes: ["Music", "Art"],
        company: "Eventify Inc.",
        price: `${id * 10}.00 - ${id * 20}.00 $`,
        image: LogoImage.src,
    };

    if (isNaN(id) || id < 1) {
        return <div className="px-custom py-4">Ticket not found</div>;
    }


    return (
        <div className="px-custom py-4 w-full">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Изображение */}
                <div className="shrink-0 w-full md:w-96">
                    <Image
                        src={LogoImage}
                        alt={ticketData.title}
                        width={384}
                        height={384}
                        className="h-96 w-full object-contain rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                    />
                </div>
                <div className="p-6 flex-1 flex flex-col gap-4">
                    {/* Заголовок */}
                    <h1 className="text-3xl font-bold text-gray-800">{ticketData.title}</h1>

                    {/* Основная информация */}
                    <div className="flex flex-col gap-3 text-gray-700">
                        {/* Формат и темы */}
                        <div className="flex items-center gap-2">
                            <Tag strokeWidth={2.5} className="w-5 h-5 text-gray-500"/>
                            <span className="text-lg font-medium">
                                {ticketData.format} • {ticketData.themes.join(", ")}
                            </span>
                        </div>

                        {/* Даты */}
                        <div className="flex items-center gap-2">
                            <CalendarDays strokeWidth={2.5} className="w-5 h-5 text-gray-500"/>
                            <span className="text-lg font-medium">
                                {ticketData.dateStart} - {ticketData.dateEnd}
                            </span>
                        </div>

                        {/* Место проведения */}
                        <div className="flex items-center gap-2">
                            <MapPin strokeWidth={2.5} className="w-5 h-5 text-gray-500"/>
                            <span className="text-lg font-medium">{ticketData.location}</span>
                        </div>

                        {/* Локация (ссылка на Google Maps) */}
                        <div className="flex items-center gap-2">
                            <MapPinned strokeWidth={2.5} className="w-5 h-5 text-gray-500"/>
                            <a
                                href={ticketData.locationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-lg font-medium text-blue-600 hover:underline"
                            >
                                View on Google Maps
                            </a>
                        </div>

                        {/* Компания */}
                        <div className="flex items-center gap-2">
                            <Building strokeWidth={2.5} className="w-5 h-5 text-gray-500"/>
                            <span className="text-lg font-medium">{ticketData.company}</span>
                        </div>
                    </div>

                    {/* Описание */}
                    <p className="text-gray-600 text-lg leading-relaxed mt-2">
                        {ticketData.description}
                    </p>

                    {/* Цена */}
                    <div className="mt-4">
                        <span className="text-2xl font-semibold text-gray-900">
                            {ticketData.price}
                        </span>
                    </div>

                    {/* Кнопка Buy */}
                    <div className="mt-6">
                        <TicketActions title={ticketData.title} price={ticketData.price}/>
                    </div>
                </div>
            </div>
        </div>
    );
}