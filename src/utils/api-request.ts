import { handleApiError } from "@/utils/handle-api-error";
import { ApiResponse } from "@/types";

export async function executeApiRequest<T>(
    request: () => Promise<any>,
    errorMessage: string
): Promise<ApiResponse<T>> {
    try {
        const response = await request();
        return { success: true, data: response.data, errors: [] };
    } catch (error) {
        return {
            success: false,
            data: undefined,
            errors: handleApiError(error, errorMessage),
        };
    }
}
