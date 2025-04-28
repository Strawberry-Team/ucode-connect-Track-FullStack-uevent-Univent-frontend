import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import { ApiResponse } from "@/types/common";
import { EventFormat } from "@/types/event";

export async function getEventFormats(): Promise<ApiResponse<EventFormat[]>> {
    return executeApiRequest<EventFormat[]>(() => api.get("/formats"), "Failed to fetch event formats");
}
