import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import { ApiResponse, NewsItem } from "@/types";

export async function updateNews(newsId: number, newsData: { title: string; description: string }): Promise<ApiResponse<NewsItem>> {
    return executeApiRequest<NewsItem>(
        () => api.patch(`/news/${newsId}`, newsData),
        `Failed to update news with ID ${newsId}`
    );
}