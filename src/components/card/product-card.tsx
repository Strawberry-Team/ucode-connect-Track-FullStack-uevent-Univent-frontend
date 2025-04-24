"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MapPinned, Tag } from "lucide-react";
import { Event } from "@/types";
import { format } from "date-fns";

interface ProductCardProps {
    event: Event;
}

const ProductCard = ({ event }: ProductCardProps) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/products/${event.id}`);
    };

    const getPriceRange = () => {
        if (!event.tickets || event.tickets.length === 0) {
            return "No tickets";
        }

        const prices = event.tickets.map((ticket) => ticket.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        return `${minPrice} - ${maxPrice} $`;
    };

    return (
        <Card
            className="pt-0 cursor-pointer w-full bg-white flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-2xl"
            onClick={handleClick}
        >
            <img
                src={
                    event.posterName
                        ? `http://localhost:8080/uploads/event-posters/${event.posterName}`
                        : "https://via.placeholder.com/300x192"
                }
                alt={event.title}
                className="h-65 w-full object-cover "
            />
            {/* Контент карточки */}
            <CardContent className="-mt-3 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                    <div className="flex flex-col gap-1 text-gray-700">
                        <p className="text-sm font-medium flex items-center gap-1 truncate max-w-full">
                            <Tag strokeWidth={2.5} className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                                {event.format.title} • {event.themes.map((theme) => theme.title).join(", ")}
                            </span>
                        </p>
                        <p className="text-sm font-medium flex items-center gap-1">
                            <CalendarDays strokeWidth={2.5} className="w-4 h-4" />
                            {format(new Date(event.startedAt), "MMMM d, yyyy HH:mm")}
                        </p>
                        <p className="text-sm font-medium flex items-center gap-1 truncate max-w-full">
                            <MapPinned strokeWidth={2.5} className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{event.venue}</span>
                        </p>
                    </div>
                </div>
                <div className="mt-2">
                    <span className="text-xl font-bold text-gray-900">
                        {getPriceRange()}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductCard;