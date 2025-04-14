import api from "@/lib/api";
import { AxiosError } from "axios";

export interface User {
    id: number;
    firstName: string;
    lastName: string | null;
    email: string;
    profilePictureName: string;
    role: string;
    createdAt: string;
}

export interface Company {
    id: number;
    ownerId: number;
    email: string;
    title: string;
    description: string;
    createdAt: string;
    logoName: string;
}

export async function getUserMe(accessToken?: string): Promise<{ success: boolean; data?: User; errors: string | string[] }> {
    try {
        if (!accessToken) {
            return { success: false, errors: "Access token not found", data: undefined };
        }

        const response = await api.get("/users/me", {
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

export async function updateUser(
    userId: number,
    data: { firstName?: string; lastName?: string | null },
): Promise<{ success: boolean; data?: User; errors: string | string[] }> {
    try {
        const response = await api.patch(`/users/${userId}`, data);

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

        return { success: false, data: undefined, errors: "Failed to update user data" };
    }
}

export async function uploadAvatar(
    userId: number,
    file: File,
): Promise<{ success: boolean; data?: { server_filename: string }; errors: string | string[] }> {
    try {
        const form = new FormData();
        form.append("file", file);

        const response = await api.post(`/users/${userId}/upload-avatar`, form, {
            headers: {
                "Content-Type": "multipart/form-data",
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

        return { success: false, data: undefined, errors: "Failed to upload avatar" };
    }
}

export async function getUserCompany(userId: number): Promise<{ success: boolean; data?: Company[] | null; errors: string | string[] }> {
    try {
        const response = await api.get(`/users/${userId}/companies`);

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

        return { success: false, data: undefined, errors: "Failed to fetch company data" };
    }
}