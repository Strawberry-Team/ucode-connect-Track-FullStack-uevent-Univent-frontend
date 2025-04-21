import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import { ApiResponse, EventFormat } from "@/types";

export async function getEventFormats(): Promise<ApiResponse<EventFormat[]>> {
    return executeApiRequest<EventFormat[]>(() => api.get("/formats"), "Failed to fetch event formats");
}
