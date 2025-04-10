import api from "@/lib/api";
import Cookies from "js-cookie";
import {AxiosError} from "axios";

export async function login(email: string, password: string): Promise<{ success: boolean; errors: string | string[] }> {
    try {
        const response = await api.post("/login", {email, password});
        const data = response.data;

        if (!data.accessToken) {
            return {success: false, errors: "Access token not provided by server"};
        }
        Cookies.set("accessToken", data.accessToken, {sameSite: "strict"});
        Cookies.set("refreshToken", data.refreshToken, {sameSite: "strict"});

        return {success: true, errors: ""};
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string | string[] }>;
        const errorData = axiosError.response?.data;

        if (errorData?.message) {
            return {
                success: false,
                errors: Array.isArray(errorData.message) ? errorData.message : [errorData.message],
            };
        }

        return {success: false, errors: "Login failed"};
    }
}

