import api from "@/lib/api";
import { AxiosError } from "axios";

export interface Company {
    id: number;
    ownerId: number;
    email: string;
    title: string;
    description: string;
    createdAt: string;
    logoName: string;
}

export async function createCompany(
    data: { email: string; title: string; description: string; ownerId: number }
): Promise<{ success: boolean; data?: Company; errors: string | string[] }> {
    try {
        const response = await api.post("/companies", data);

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

        return { success: false, data: undefined, errors: "Failed to create company" };
    }
}

export async function uploadCompanyLogo(
    companyId: number,
    file: File
): Promise<{ success: boolean; data?: { server_filename: string }; errors: string | string[] }> {
    try {
        const form = new FormData();
        form.append("file", file);

        const response = await api.post(`/companies/${companyId}/upload-logo`, form, {
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

        return { success: false, data: undefined, errors: "Failed to upload company logo" };
    }
}