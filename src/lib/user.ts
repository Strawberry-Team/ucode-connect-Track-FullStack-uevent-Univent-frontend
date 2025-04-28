import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import {ApiResponse, User, Company, Order, EventSubscription, CompanySubscription} from "@/types";

export async function getUserMe(accessToken?: string): Promise<ApiResponse<User>> {
    if (!accessToken) return { success: false, errors: ["Access token not found"] };
    return executeApiRequest<User>(() =>
            api.get("/users/me", {
                headers: { Authorization: `Bearer ${accessToken}` },
            }), "Failed to fetch user data");
}

export async function updateUser(userId: number, data: { firstName?: string; lastName?: string | null }): Promise<ApiResponse<User>> {
    return executeApiRequest<User>(() => api.patch(`/users/${userId}`, data), "Failed to update user data");
}

export async function uploadAvatar(userId: number, file: File): Promise<ApiResponse<{ server_filename: string }>> {
    return executeApiRequest<{ server_filename: string }>(
        () => {
            const form = new FormData();
            form.append("file", file);
            return api.post(`/users/${userId}/upload-avatar`, form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }, "Failed to upload avatar");
}

export async function getUserCompany(userId: number): Promise<ApiResponse<Company[] | null>> {
    return executeApiRequest<Company[] | null>(() => api.get(`/users/${userId}/companies`), "Failed to fetch company data");
}

export async function getUserOrders(userId: number): Promise<ApiResponse<Order[]>> {
    return executeApiRequest<Order[]>(() => api.get(`/users/${userId}/orders`), "Failed to fetch user orders");
}

export async function getUserEventSubscriptions(userId: number): Promise<ApiResponse<EventSubscription[]>> {
    return executeApiRequest(
        () => api.get(`/users/${userId}/subscriptions/events`),
        `Failed to fetch event subscriptions for user with ID ${userId}`
    );
}

export async function getUserCompanySubscriptions(userId: number): Promise<ApiResponse<CompanySubscription[]>> {
    return executeApiRequest(
        () => api.get(`/users/${userId}/subscriptions/companies`),
        "Failed to fetch user company subscriptions"
    );
}