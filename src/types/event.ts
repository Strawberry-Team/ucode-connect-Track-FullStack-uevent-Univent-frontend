import { TicketType } from "@/types/ticket";

export interface Event {
    id: number;
    companyId: number;
    formatId: number;
    title: string;
    description: string;
    venue: string;
    locationCoordinates: string;
    startedAt: string;
    endedAt: string;
    publishedAt: string;
    ticketsAvailableFrom: string;
    posterName: string;
    attendeeVisibility: string;
    status: string;
    format: {
        id: number;
        title: string;
    };
    themes: {
        id: number;
        title: string;
    }[];
    company: {
        id: number;
        title: string;
        logoName: string;
    };
    tickets: {
        id: number;
        eventId: number;
        title: string;
        price: number;
        status: string;
    }[];
}

export interface EventsResponse {
    items: Event[];
    count: number;
    total: number;
    minPrice: number;
    maxPrice: number;
}

export interface EventFormat {
    id: number;
    title: string;
}

export interface Theme {
    id: number;
    title: string;
}

export interface EventSubscription {
    id: number;
    eventId: number;
    createdAt: string;
    event: Event;
}

export interface EventAttendee {
    id: number;
    eventId: number;
    userId: number;
    isVisible: boolean;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        profilePictureName: string;
    };
} 

export interface ProductCardProps {
    event: Event;
    className?: string;
    hasMoved?: boolean;
}

export interface CreateEventModalProps {   
    companyId: number
    isOpen: boolean
    onClose: () => void
    onEventCreated: (newEvent: Event) => void
}

export interface EventFormProps {
    eventId: number;
};

export interface EventInfoCardProps {
    setEditMode: (editMode: boolean) => void;
    editMode: boolean;
    eventId: number;
};

export interface NewsNotification {
    type: "news";
    title: string;
    description: string;
    createdAt: string;
}

export interface EventPageProps {
    data: {
        event: Event;
        ticketTypes: TicketType[];
        newsNotifications: NewsNotification[];
        eventId: number;
    } | { error: string };
}

export interface EventsCardListProps {
    events: Event[];
    totalCount: number;
    isLoading: boolean;
}

export interface EventsCardProps {
    companyId: number;
};

export interface CompanyEventsCarouselProps {
    companyId: number;
    currentEventId?: number;
}

export interface SimilarEventsCarouselProps {
    currentEventId?: number;
    themes?: string;
}

export interface EventsPopularCardCarouselProps {
    events: Event[];
    isLoading: boolean;
}

export interface EventFiltersProps {
    formats: EventFormat[];
    themes: Theme[];
    minPrice: number;
    maxPrice: number;
}