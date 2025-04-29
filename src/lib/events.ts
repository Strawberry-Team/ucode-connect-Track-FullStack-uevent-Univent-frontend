import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import { ApiResponse } from "@/types/common";
import { Event, EventsResponse, EventAttendee } from "@/types/event";
import { CreatePromoCodeRequest, PromoCode, InvalidPromoCode, ValidPromoCode } from "@/types/promo-code";
import { CreateTicketRequest, Ticket, TicketsResponse, TicketTypesResponse } from "@/types/ticket";
import { NewsItem } from "@/types/news";

export async function getEvents(skip?: number, take?: number, formats?: string, themes?: string, startedAt?: string, endedAt?: string, title?: string, minPrice?: number, maxPrice?: number, sortBy?: string, sortOrder?: string): Promise<ApiResponse<EventsResponse>> {
    let url = "/events";
    const queryParams: string[] = [];

    if (skip !== undefined) queryParams.push(`skip=${skip}`);
    if (take !== undefined) queryParams.push(`take=${take}`);
    if (formats) queryParams.push(`formats=${formats}`);
    if (themes) queryParams.push(`themes=${themes}`);
    if (startedAt) queryParams.push(`startedAt=${startedAt}`);
    if (endedAt) queryParams.push(`endedAt=${endedAt}`);
    if (title) queryParams.push(`title=${encodeURIComponent(title)}`);
    if (minPrice !== undefined) queryParams.push(`minPrice=${minPrice}`);
    if (maxPrice !== undefined) queryParams.push(`maxPrice=${maxPrice}`);
    if (sortBy) queryParams.push(`sortBy=${sortBy}`);
    if (sortOrder) queryParams.push(`sortOrder=${sortOrder}`);
    if (queryParams.length > 0) url += `?${queryParams.join("&")}`;

    return executeApiRequest<EventsResponse>(() => api.get(url), "Failed to fetch events");
}

export async function createEvent(
    data: { title: string; description: string; venue: string; companyId: number; formatId: number; locationCoordinates: string; startedAt: string; endedAt: string; publishedAt: string; ticketsAvailableFrom: string;status: string;attendeeVisibility: string;}): Promise<ApiResponse<Event>> {
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

export async function getEventByIdNews(eventId: number): Promise<ApiResponse<NewsItem[]>> {
    return executeApiRequest<NewsItem[]>(() => api.get(`/events/${eventId}/news`), `Failed to fetch news for event with ID ${eventId}`);
}

export async function createEventNews(eventId: number, newsData: { title: string; description: string }): Promise<ApiResponse<NewsItem>> {
    return executeApiRequest<NewsItem>(() => api.post(`/events/${eventId}/news`, newsData), `Failed to create news for event with ID ${eventId}`);
}

export async function assignThemesToEvent(eventId: number, themeIds: number[]): Promise<ApiResponse<void>> {
    return executeApiRequest<void>(() => api.post(`/events/${eventId}/themes`, { themes: themeIds.map((id) => ({ id })) }), `Failed to assign themes to event with ID ${eventId}`);
}

export async function getEventPromoCodes(eventId: number): Promise<ApiResponse<PromoCode[]>> {
    return executeApiRequest<PromoCode[]>(() => api.get(`/events/${eventId}/promo-codes`), `Failed to fetch promo codes for event with ID ${eventId}`);
}

export async function createEventPromoCode(eventId: number, promoCodeData: CreatePromoCodeRequest): Promise<ApiResponse<PromoCode>> {
    return executeApiRequest<PromoCode>(() => api.post(`/events/${eventId}/promo-codes`, promoCodeData), `Failed to create promo code for event with ID ${eventId}`);
}

export async function getEventTickets(eventId: number): Promise<ApiResponse<TicketsResponse>> {
    return executeApiRequest<TicketsResponse>(() => api.get(`/events/${eventId}/tickets`), `Failed to fetch tickets for event ${eventId}`);
}

export async function createEventTicket(eventId: number, ticketData: CreateTicketRequest): Promise<ApiResponse<Ticket>> {
    return executeApiRequest<Ticket>(() => api.post(`/events/${eventId}/tickets`, ticketData), `Failed to create ticket for event ${eventId}`);
}

export async function getEventTicketTypes(eventId: number): Promise<ApiResponse<TicketTypesResponse>> {
    return executeApiRequest<TicketTypesResponse>(() => api.get(`/events/${eventId}/ticket-types`), `Failed to fetch ticket types for event ${eventId}`);
}

export async function getEventAttendees(eventId: number): Promise<ApiResponse<EventAttendee[]>> {
    return executeApiRequest<EventAttendee[]>(() => api.get(`/events/${eventId}/attendees`), `Failed to fetch attendees for event with ID ${eventId}`);
}

export async function updateEventAttendeeVisibility(attendeeId: number, isVisible: boolean): Promise<ApiResponse<EventAttendee>> {
    return executeApiRequest<EventAttendee>(
        () => api.patch(`/event-attendees/${attendeeId}`, { isVisible }),
        `Failed to update visibility for attendee with ID ${attendeeId}`
    );
}