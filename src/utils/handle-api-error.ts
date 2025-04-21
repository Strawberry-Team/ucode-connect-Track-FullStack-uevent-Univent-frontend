import { AxiosError } from "axios";

export function handleApiError(error: unknown, defaultMessage: string): string[] {
    const axiosError = error as AxiosError<{ message?: string | string[] }>;
    const errorData = axiosError.response?.data;
    return errorData?.message
        ? Array.isArray(errorData.message)
            ? errorData.message
            : [errorData.message]
        : [defaultMessage];
}
