"use client";

import {format} from "date-fns";
import Link from "next/link";
import {CalendarDays, MapPin, Tag, Building} from "lucide-react";
import SubscriptionActions from "@/components/subscription/subscription-actions";
import AttendeesAndNewsBlock from "@/components/attendees-and-news/attendees-and-news-block";
import CommentsDisqus from "@/components/comment/comment";
import CompanyEventsCarousel from "@/components/event/company-events-carousel";
import SimilarEventsCarousel from "@/components/event/similar-events-carousel";
import GoogleMapIframe from "@/components/google-map/google-map-iframe";
import {useAuth} from "@/context/auth-context";
import {Event, EventPageProps} from "@/types/event";
import TicketActions from "@/components/ticket/ticket-actions";
import { BASE_EVENT_POSTER_URL } from "@/lib/constants";

export default function EventPage({data}: EventPageProps) {
    const {isAuthenticated, user} = useAuth();

    if ("error" in data) {
        return <div className="px-custom py-4">{data.error}</div>;
    }

    const {event, ticketTypes, newsNotifications, eventId} = data;

    const dateStart = format(new Date(event.startedAt), "MMMM d, yyyy HH:mm");
    const dateEnd = format(new Date(event.endedAt), "MMMM d, yyyy HH:mm");

    const getPriceRange = (): string => {
        if (!ticketTypes || ticketTypes.length === 0) {
            return "No ticket";
        }

        const prices = ticketTypes.map((ticket) => ticket.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        return `$${minPrice} - $${maxPrice}`;
    };

    const price = getPriceRange();

    const imageUrl = event.posterName
        ? `${BASE_EVENT_POSTER_URL}${event.posterName}`
        : "https://via.placeholder.com/384x384";

    // Формируем строку тем для запроса, используя ID тем
    const themes = event.themes.map((theme) => theme.id).join(",");

    return (
        <div className="px-custom py-4 w-full">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="shrink-0 w-full md:w-90">
                    <img
                        src={imageUrl}
                        alt={event.title}
                        width={384}
                        height={384}
                        className="md:h-130 object-cover w-full object-contain"
                    />
                </div>

                <div className="px-3 flex-1 flex flex-col gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>

                    <div className="flex flex-col gap-3 text-gray-700">
                        <div className="flex items-center gap-2">
                            <Tag strokeWidth={2.5} className="w-5 h-5 text-gray-500"/>
                            <span className="text-lg font-medium">
                                {event.format.title} • {event.themes.map((theme) => theme.title).join(", ")}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <CalendarDays strokeWidth={2.5} className="w-5 h-5 text-gray-500"/>
                            <span className="text-lg font-medium">
                                {dateStart} - {dateEnd}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin strokeWidth={2.5} className="w-5 h-5 text-gray-500"/>
                            <span className="text-lg font-medium">{event.venue}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Building strokeWidth={2.5} className="w-5 h-5 text-gray-500"/>
                            <Link href={`/companies/${event.company.id}`}>
                                <span className="text-lg font-medium underline">{event.company.title}</span>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-2">
                        <span className="text-2xl font-semibold text-gray-900">{price}</span>
                    </div>

                    {isAuthenticated && user && (
                        <div className="flex items-start gap-5 flex-wrap py-5">
                            <TicketActions eventId={event.id} eventTitle={event.title} eventType={event.format.title}/>
                            <SubscriptionActions title={event.title} entityId={event.id} userId={user?.id}/>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-8">
                <div className="flex-1 md:flex-[2]">
                    <AttendeesAndNewsBlock eventId={eventId}/>
                </div>
                <div className="flex-1 md:flex-[4]">
                    <AttendeesAndNewsBlock notifications={newsNotifications}/>
                </div>
            </div>

            <div className="mt-8 border-t">
                <div className="my-6">
                    <div className="block">
                        <GoogleMapIframe coordinates={event.locationCoordinates}/>
                        <p className="mt-5 text-gray-600 text-lg leading-relaxed">{event.description}</p>
                    </div>
                    <div className="clear-both"></div>
                </div>
            </div>

            <CompanyEventsCarousel companyId={event.company.id} currentEventId={event.id}/>
            <SimilarEventsCarousel currentEventId={event.id} themes={themes}/>

            <CommentsDisqus
                id={event.id}
                title={event.title}
                url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/products/${event.id}`}
            />
        </div>
    );
};