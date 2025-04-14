"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MapPinned, Tag } from "lucide-react";
import { Event } from "@/lib/event";

interface ProductCardProps {
    event: Event;
}

const ProductCard = ({ event }: ProductCardProps) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/products/${event.id}`);
    };

    // Форматируем дату начала события
    const startDate = new Date(event.startedAt).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <Card
            className="cursor-pointer w-full bg-white flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-2xl"
            onClick={handleClick}
        >
            {/* Постер события */}
            <img
                src={
                    event.posterName
                        ? `http://localhost:8080/uploads/event-posters/${event.posterName}`
                        : "https://via.placeholder.com/300x192"
                }
                alt={event.title}
                className="h-48 w-full object-contain"
            />
            {/* Контент карточки */}
            <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                    <div className="flex flex-col gap-1 text-gray-700">
                        <p className="text-sm font-medium flex items-center gap-1">
                            <Tag strokeWidth={2.5} className="w-4 h-4" />
                            Event • {event.formatId === 1 ? "Conference" : "Other"}
                        </p>
                        <p className="text-sm font-medium flex items-center gap-1">
                            <CalendarDays strokeWidth={2.5} className="w-4 h-4" />
                            {startDate}
                        </p>
                        <p className="text-sm font-medium flex items-center gap-1 truncate max-w-full">
                            <MapPinned strokeWidth={2.5} className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{event.venue}</span>
                        </p>
                    </div>
                </div>
                <div className="mt-2">
                    {/* Здесь цены пока захардкодим, так как в данных с бэкенда их нет */}
                    <span className="text-xl font-bold text-gray-900">
                        {(event.id * 10).toFixed(2)} - {(event.id * 20).toFixed(2)} $
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductCard;