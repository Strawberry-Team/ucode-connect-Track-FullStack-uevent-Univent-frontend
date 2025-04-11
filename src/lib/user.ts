import api from "@/lib/api";
import Cookies from "js-cookie";
import {AxiosError} from "axios";

export interface User {
    firstName: string;
    email: string;
    profilePictureName: string;
}

export async function getUser(): Promise<{ success: boolean; data?: User; errors: string | string[] }> {
    try {
        const accessToken = Cookies.get("accessToken");
        if (!accessToken) {
            return { success: false, errors: "Access token not found", data: undefined };
        }

        const response = await api.get("user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

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

        return { success: false, data: undefined, errors: "Failed to fetch user data" };
    }
}