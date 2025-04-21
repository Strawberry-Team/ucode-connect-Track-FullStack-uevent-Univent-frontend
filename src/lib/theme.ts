import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import { ApiResponse, Theme } from "@/types";

export async function getThemes(): Promise<ApiResponse<Theme[]>> {
    return executeApiRequest<Theme[]>(() => api.get("/themes"), "Failed to fetch themes");
}
