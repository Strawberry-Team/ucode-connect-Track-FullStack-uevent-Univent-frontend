import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import { ApiResponse, Notification, NotificationsResponse, UpdateAllNotificationsResponse } from "@/types";
import { showErrorToasts } from "./toast";

export async function getUserNotifications(userId: number): Promise<ApiResponse<NotificationsResponse>> {
    return executeApiRequest<NotificationsResponse>(() => 
        api.get(`/users/${userId}/notifications`),
        "Failed to fetch notifications"
    );
}

export async function markNotificationAsRead(userId: number, notificationId: number): Promise<ApiResponse<Notification>> {
    return executeApiRequest<Notification>(
        () => api.patch(`/notifications/${notificationId}`, { action: "read" }),
        "Failed to mark notification as read"
    );
}

export async function markNotificationAsHidden(userId: number, notificationId: number): Promise<ApiResponse<Notification>> {
    return executeApiRequest<Notification>(
        () => api.patch(`/notifications/${notificationId}`, { action: "hide" }),
        "Failed to mark notification as hidden"
    );
}