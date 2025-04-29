// EventCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MapPinned, Tag } from "lucide-react";
import { Event, ProductCardProps } from "@/types/event";
import { format } from "date-fns";

const EventCard = ({ event, className, hasMoved = false }: ProductCardProps) => {
    const router = useRouter();

    const handleClick = () => {
        if (hasMoved) return;
        router.push(`/events/${event.id}`);
    };

    const getPriceRange = () => {
        if (!event.tickets || event.tickets.length === 0) {
            return "No ticket";
        }

        const prices = event.tickets.map((ticket) => ticket.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        return `$${minPrice} - $${maxPrice}`;
    };

    return (
        <Card
            className={`pt-0 cursor-pointer w-full bg-white flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-2xl ${className || ""}`}
            onClick={handleClick}
        >
            <img
                src={
                    event.posterName
                        ? `http://localhost:8080/uploads/event-posters/${event.posterName}`
                        : "https://via.placeholder.com/300x192"
                }
                alt={event.title}
                className="w-full object-cover h-65"
            />
            <CardContent className="-mt-3 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-gray-900 truncate text-xl">{event.title}</h3>
                    <div className="flex flex-col gap-1 text-gray-700">
                        <p className="font-medium flex items-center gap-1 truncate max-w-full text-sm">
                            <Tag strokeWidth={2.5} className="flex-shrink-0 w-4 h-4" />
                            <span className="truncate">
                {event.format.title} • {event.themes.map((theme) => theme.title).join(", ")}
              </span>
                        </p>
                        <p className="font-medium flex items-center gap-1 text-sm">
                            <CalendarDays strokeWidth={2.5} className="flex-shrink-0 w-4 h-4" />
                            {format(new Date(event.startedAt), "MMMM d, yyyy HH:mm")}
                        </p>
                        <p className="font-medium flex items-center gap-1 truncate max-w-full text-sm">
                            <MapPinned strokeWidth={2.5} className="flex-shrink-0 w-4 h-4" />
                            <span className="truncate">{event.venue}</span>
                        </p>
                    </div>
                </div>
                <div className="mt-2">
                    <span className="font-bold text-gray-900 text-xl">{getPriceRange()}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default EventCard;