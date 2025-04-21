import { format } from "date-fns";
import Link from "next/link";
import { getEventById, getEventByIdNews } from "@/lib/event";
import { generateMapEmbedUrl } from "@/utils/generateMapEmbedUrl"; // Импортируем новую утилиту
import { CalendarDays, MapPinned, MapPin, Tag, Building } from "lucide-react";
import TicketActions from "@/components/card/TicketActions";
import NotificationsBlock from "@/components/notification/NotificationsBlock";

interface NewsNotification {
    type: "news";
    title: string;
    description: string;
    createdAt: string;
}

interface UserNotification {
    type: "user";
    firstName: string;
    lastName: string;
    createdAt: string;
    avatarUrl: string;
}

export default async function PageCard({ params }: { params: Promise<{ product: string }> }) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.product, 10);

    if (isNaN(id) || id < 1) {
        return <div className="px-custom py-4">Ticket not found</div>;
    }

    const eventResponse = await getEventById(id);
    if (!eventResponse.success || !eventResponse.data) {
        return <div className="px-custom py-4">Event not found: {eventResponse.errors}</div>;
    }

    const notificationsResponse = await getEventByIdNews(id);
    const rawNewsNotifications = notificationsResponse.success && notificationsResponse.data ? notificationsResponse.data : [];

    const newsNotifications: NewsNotification[] = rawNewsNotifications.map((notification) => ({
        type: "news" as const,
        title: notification.title,
        description: notification.description,
        createdAt: notification.createdAt,
    }));

    const rawUserNotifications = [
        {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            createdAt: "2025-04-15T10:07:28.000Z",
            avatarUrl: `http://localhost:8080/uploads/event-posters/default-poster.png`,
        },
        {
            id: 2,
            firstName: "Jane",
            lastName: "Smith",
            createdAt: "2025-04-15T10:08:00.000Z",
            avatarUrl: `http://localhost:8080/uploads/event-posters/default-poster.png`,
        },
        {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            createdAt: "2025-04-15T10:07:28.000Z",
            avatarUrl: `http://localhost:8080/uploads/event-posters/default-poster.png`,
        },
    ];

    const userNotifications: UserNotification[] = rawUserNotifications.map((user) => ({
        type: "user" as const,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        avatarUrl: user.avatarUrl,
    }));

    const event = eventResponse.data;
    const dateStart = format(new Date(event.startedAt), "MMMM d, yyyy HH:mm");
    const dateEnd = format(new Date(event.endedAt), "MMMM d, yyyy HH:mm");
    const price = `${(event.id * 10).toFixed(2)} - ${(event.id * 20).toFixed(2)} $`;
    const imageUrl = event.posterName
        ? `http://localhost:8080/uploads/event-posters/${event.posterName}`
        : "https://via.placeholder.com/384x384";
    
    const mapEmbedUrl = generateMapEmbedUrl(event.locationCoordinates);

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
                            <Tag strokeWidth={2.5} className="w-5 h-5 text-gray-500" />
                            <span className="text-lg font-medium">
                                {event.format.title} • {event.themes.map((theme) => theme.title).join(", ")}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <CalendarDays strokeWidth={2.5} className="w-5 h-5 text-gray-500" />
                            <span className="text-lg font-medium">
                                {dateStart} - {dateEnd}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin strokeWidth={2.5} className="w-5 h-5 text-gray-500" />
                            <span className="text-lg font-medium">{event.venue}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Building strokeWidth={2.5} className="w-5 h-5 text-gray-500" />
                            <Link href={`/company/${event.company.id}`}>
                                <span className="text-lg font-medium underline">
                                    {event.company.title}
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-2">
                        <span className="text-2xl font-semibold text-gray-900">{price}</span>
                    </div>

                    <div>
                        <TicketActions title={event.title} price={price} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-8">
                <div className="flex-1 md:flex-[2]">
                    <NotificationsBlock notifications={userNotifications} />
                </div>
                <div className="flex-1 md:flex-[4]">
                    <NotificationsBlock notifications={newsNotifications} />
                </div>
            </div>

            <div className="mt-8 border-t">
                <div className="my-6">
                    <div className="block">
                        <iframe
                            src={mapEmbedUrl}
                            width="100%"
                            height="300"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="md:w-[500px] rounded-lg md:float-right md:ml-6"
                        ></iframe>
                        <p className="mt-5 text-gray-600 text-lg leading-relaxed">{event.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}