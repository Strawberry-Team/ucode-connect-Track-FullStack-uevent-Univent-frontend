import api from "@/lib/api";
import Cookies from "js-cookie";
import {AxiosError} from "axios";

export async function login(email: string, password: string): Promise<{ success: boolean; errors: string | string[] }> {
    try {
        const response = await api.post("/auth/login", {email, password});
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

export async function register(firstName: string, lastName: string, email: string, password: string): Promise<{ success: boolean; errors: string | string[] }> {
    try {
        await api.post("/auth/register", {firstName, lastName, email, password,});
        return { success: true, errors: "" };
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string | string[] }>;
        const errorData = axiosError.response?.data;

        if (errorData?.message) {
            return {
                success: false,
                errors: Array.isArray(errorData.message) ? errorData.message : [errorData.message],
            };
        }

        return { success: false, errors: "Registration failed" };
    }
}

export async function confirmEmail(confirmToken: string): Promise<{ success: boolean; errors: string | string[] }> {
    try {
        await api.post(`/auth/confirm-email/${confirmToken}`);
        return { success: true, errors: "" };
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string | string[] }>;
        const errorData = axiosError.response?.data;

        if (errorData?.message) {
            return {
                success: false,
                errors: Array.isArray(errorData.message) ? errorData.message : [errorData.message],
            };
        }

        return { success: false, errors: "Email confirmation failed" };
    }
}

export async function resetPassword(email: string): Promise<{ success: boolean; errors: string | string[] }> {
    try {
        await api.post("/auth/reset-password", { email });
        return { success: true, errors: "" };
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string | string[] }>;
        const errorData = axiosError.response?.data;

        if (errorData?.message) {
            return {
                success: false,
                errors: Array.isArray(errorData.message) ? errorData.message : [errorData.message],
            };
        }

        return { success: false, errors: "Failed to send password reset link" };
    }
}

export async function changePassword(confirmToken: string, newPassword: string): Promise<{ success: boolean; errors: string | string[] }> {
    try {
        await api.post(`/auth/reset-password/${confirmToken}`, { newPassword });
        return { success: true, errors: "" };
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string | string[] }>;
        const errorData = axiosError.response?.data;

        if (errorData?.message) {
            return {
                success: false,
                errors: Array.isArray(errorData.message) ? errorData.message : [errorData.message],
            };
        }

        return { success: false, errors: "Failed to change password" };
    }
}

export async function logout(): Promise<{ success: boolean; errors: string | string[] }> {
    try {
        const refreshToken = Cookies.get("refreshToken");
        await api.post("/auth/logout", { refreshToken });
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        return { success: true, errors: "" };
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string | string[] }>;
        const errorData = axiosError.response?.data;

        if (errorData?.message) {
            return {
                success: false,
                errors: Array.isArray(errorData.message) ? errorData.message : [errorData.message],
            };
        }

        return { success: false, errors: "Logout failed" };
    }
}

export async function refreshAccessToken(): Promise<{ success: boolean; errors: string | string[] }> {
    try {
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) {
            return { success: false, errors: "No refresh token available" };
        }

        const response = await api.post("/auth/access-token/refresh", { refreshToken });
        const data = response.data;

        if (!data.accessToken) {
            return { success: false, errors: "Access token not provided by server" };
        }

        Cookies.set("accessToken", data.accessToken, { sameSite: "strict" });
        if (data.refreshToken) {
            Cookies.set("refreshToken", data.refreshToken, { sameSite: "strict" });
        }

        return { success: true, errors: "" };
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string | string[] }>;
        const errorData = axiosError.response?.data;

        if (errorData?.message) {
            return {
                success: false,
                errors: Array.isArray(errorData.message) ? errorData.message : [errorData.message],
            };
        }

        return { success: false, errors: "Failed to refresh access token" };
    }
}