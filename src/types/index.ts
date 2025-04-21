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
}

export interface EventFormat {
    id: number;
    title: string;
}

export interface Theme {
    id: number;
    title: string;
}

export interface Notification {
    title: string;
    description: string;
    createdAt: string;
}