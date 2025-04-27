export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    errors: string[];
};

export interface AuthResponse {
    accessToken: string;
    refreshToken?: string;
}

export interface User {
    id: number;
    firstName: string;
    lastName: string | null;
    email: string;
    profilePictureName: string;
    role: string;
    createdAt: string;
}

export interface Company {
    id: number;
    ownerId: number;
    email: string;
    title: string;
    description: string;
    createdAt: string;
    logoName: string;
}

export interface CompanyNews {
    id: number;
    authorId: number;
    companyId: number;
    eventId: number | null;
    title: string;
    description: string;
    createdAt: string;
}

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

export interface NewsItem {
    id: number;
    authorId: number;
    companyId: number | null;
    eventId: number | null;
    title: string;
    description: string;
    createdAt: string;
}

export interface Ticket {
    id: number;
    eventId: number;
    title: string;
    number: string;
    price: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface TicketType {
    title: string;
    price: number;
    count: number;
}

export interface TicketTypesResponse {
    items: TicketType[];
    total: number;
}

export interface TicketsResponse {
    items: Ticket[];
    total: number;
}

export interface CreateTicketRequest {
    title: string;
    price: number;
    status: string;
    quantity: number;
}

export type PromoCode = {
    id: number;
    eventId: number;
    title: string;
    code?: string;
    discountPercent: number;
    isActive: boolean;
};

export type CreatePromoCodeRequest = {
    title: string;
    code: string;
    discountPercent: number;
    isActive: boolean;
};

export type UpdatePromoCodeRequest = {
    title: string;
    isActive: boolean;
};

export interface NavUserProps {
    user: User;
}

interface NotificationEvent {
    id: number;
    title: string;
    logoName: string | null;
}

interface NotificationCompany {
    id: number;
    title: string;
    logoName: string | null;
}

export interface Notification {
    id: number;
    userId: number;
    eventId: number | null;
    companyId: number | null;
    title: string;
    content: string;
    readAt: string | null;
    hiddenAt: string | null;
    createdAt: string;
    event?: NotificationEvent;
    company?: NotificationCompany;
}

export interface NotificationsResponse {
    notifications: Notification[];
}

export interface NotificationListProps {
    notifications: Notification[];
}

export interface NotificationButtonProps {
    unreadCount?: number;
    onClick?: () => void;
    notifications?: Notification[];
    onUpdate: () => void;
}

export interface UpdateAllNotificationsResponse {
    updatedCount: number;
}

export type OrderItem = {
    id: number;
    finalPrice: number;
    ticket: {
        id: number;
        title: string;
        price: number;
        number: string;
        event: {
            id: number;
            title: string;
            startedAt: string;
            endedAt: string;
            posterName: string;
        };
    };
};

export type Order = {
    id: number;
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    promoCode: PromoCode;
    orderItems: OrderItem[];
};