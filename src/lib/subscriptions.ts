import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import {ApiResponse, SubscriptionRequest, SubscriptionResponse} from "@/types";

export async function createSubscription(data: SubscriptionRequest): Promise<ApiResponse<SubscriptionResponse>> {
    return executeApiRequest(
        () => api.post("/subscriptions", data),
        "Failed to subscribe to event notifications"
    );
}

export async function deleteSubscription(subscriptionId: number): Promise<ApiResponse<void>> {
    return executeApiRequest(
        () => api.delete(`/subscriptions/${subscriptionId}`),
        `Failed to unsubscribe from event notifications with ID ${subscriptionId}`
    );
}