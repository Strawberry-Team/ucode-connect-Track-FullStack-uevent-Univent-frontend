import api from "@/lib/api";
import { AxiosError } from "axios";

// Интерфейс для события
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

export interface Notification {
    title: string;
    description: string;
    createdAt: string;
}

export async function getEvents(): Promise<{
    success: boolean;
    data?: Event[];
    errors: string | string[];
}> {
    try {
        const response = await api.get("/events");

        return { success: true, data: response.data, errors: "" };
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string | string[] }>;
        const errorData = axiosError.response?.data;

        if (errorData?.message) {
            return {
                success: false,
                data: undefined,
                errors: Array.isArray(errorData.message) ? errorData.message : [errorData.message],
            };
        }

        return { success: false, data: undefined, errors: "Failed to fetch events" };
    }
}

export async function getEventById(id: number): Promise<{
    success: boolean;
    data?: Event;
    errors: string | string[];
}> {
    try {
        const response = await api.get(`/events/${id}`);

        return { success: true, data: response.data, errors: "" };
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string | string[] }>;
        const errorData = axiosError.response?.data;

        if (errorData?.message) {
            return {
                success: false,
                data: undefined,
                errors: Array.isArray(errorData.message) ? errorData.message : [errorData.message],
            };
        }

        return { success: false, data: undefined, errors: `Failed to fetch event with ID ${id}` };
    }
}

export async function getEventByIdNews(eventId: number): Promise<{
    success: boolean;
    data?: Notification[];
    errors: string | string[];
}> {
    try {
        const response = await api.get(`/events/${eventId}/news`);
        return {success: true, data: response.data, errors: ""};
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string | string[] }>;
        const errorData = axiosError.response?.data;

        if (errorData?.message) {
            return {
                success: false,
                data: undefined,
                errors: Array.isArray(errorData.message) ? errorData.message : [errorData.message],
            };
        }
        return {success: false, data: undefined, errors: `Failed to fetch news for event ${eventId}`};
    }
}