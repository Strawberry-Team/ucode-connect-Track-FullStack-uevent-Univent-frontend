import { getEventById, getEventByIdNews, getEventTicketTypes } from "@/lib/event";
import EventPage from "@/components/event/event-page";

interface NewsNotification {
    type: "news";
    title: string;
    description: string;
    createdAt: string;
}

interface PageCardProps {
    params: Promise<{ event_id: string }>;
}

export default async function PageCard({ params }: PageCardProps) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.event_id, 10);

    if (isNaN(id) || id < 1) {
        return <EventPage data={{ error: "Ticket not found" }} />;
    }

    const eventResponse = await getEventById(id);
    if (!eventResponse.success || !eventResponse.data) {
        return <EventPage data={{ error: `Event not found: ${eventResponse.errors}` }} />;
    }

    const ticketTypesResponse = await getEventTicketTypes(id);
    const ticketTypes = ticketTypesResponse.success && ticketTypesResponse.data?.items
        ? ticketTypesResponse.data.items
        : [];

    const notificationsResponse = await getEventByIdNews(id);
    const rawNewsNotifications = notificationsResponse.success && notificationsResponse.data
        ? notificationsResponse.data
        : [];

    const newsNotifications: NewsNotification[] = rawNewsNotifications.map((notification) => ({
        type: "news" as const,
        title: notification.title,
        description: notification.description,
        createdAt: notification.createdAt,
    }));

    const event = eventResponse.data;

    return (
        <EventPage
            data={{
                event,
                ticketTypes,
                newsNotifications,
                eventId: id,
            }}
        />
    );
}