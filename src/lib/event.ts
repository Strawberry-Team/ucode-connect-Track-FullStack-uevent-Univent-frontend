import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import { ApiResponse, Event, Notification } from "@/types";

export async function getEvents(): Promise<ApiResponse<Event[]>> {
    return executeApiRequest<Event[]>(() => api.get("/events"), "Failed to fetch events");
}

export async function createEvent(
    data: { title: string; description: string; venue: string; companyId: number; formatId: number; locationCoordinates: string; startedAt: string; endedAt: string; }): Promise<ApiResponse<Event>> {
    return executeApiRequest<Event>(() => api.post("/events", data), "Failed to create event");
}

export async function updateEvent(eventId: number, data: { title: string; description: string; venue: string; formatId: number; locationCoordinates: string; startedAt: string; endedAt: string; publishedAt?: string; ticketsAvailableFrom?: string; attendeeVisibility?: string; status?: string; }): Promise<ApiResponse<Event>> {
    return executeApiRequest<Event>(() => api.patch(`/events/${eventId}`, data), `Failed to update event with ID ${eventId}`);
}

export async function uploadEventPoster(eventId: number, file: File): Promise<ApiResponse<{ server_filename: string }>> {
    return executeApiRequest<{ server_filename: string }>(
        () => {
            const form = new FormData();
            form.append("file", file);
            return api.post(`/events/${eventId}/upload-poster`, form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }, `Failed to upload poster for event with ID ${eventId}`);
}

export async function getEventById(id: number): Promise<ApiResponse<Event>> {
    return executeApiRequest<Event>(() => api.get(`/events/${id}`), `Failed to fetch event with ID ${id}`);
}

export async function getEventByIdNews(eventId: number): Promise<ApiResponse<Notification[]>> {
    return executeApiRequest<Notification[]>(() => api.get(`/events/${eventId}/news`), `Failed to fetch news for event with ID ${eventId}`);
}

export async function assignThemesToEvent(eventId: number, themeIds: number[]): Promise<ApiResponse<void>> {
    return executeApiRequest<void>(() => api.post(`/events/${eventId}/themes`, { themes: themeIds.map((id) => ({ id })) }), `Failed to assign themes to event with ID ${eventId}`);
}