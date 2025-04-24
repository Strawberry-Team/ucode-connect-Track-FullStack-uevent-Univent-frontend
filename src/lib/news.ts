import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import { ApiResponse, Notification } from "@/types";

export async function updateNews(newsId: number, newsData: { title: string; description: string }): Promise<ApiResponse<Notification>> {
    return executeApiRequest<Notification>(
        () => api.patch(`/news/${newsId}`, newsData),
        `Failed to update news with ID ${newsId}`
    );
}