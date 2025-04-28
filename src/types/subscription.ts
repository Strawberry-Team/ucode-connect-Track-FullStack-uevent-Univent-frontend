export interface SubscriptionRequest {
    entityId: number;
    entityType: "event" | "company";
}

export interface SubscriptionResponse {
    id: number;
    userId: number;
    entityId: number;
    entityType: "event" | "company";
    createdAt: string;
}

export interface SubscriptionActionsProps {
    title: string;
    entityId: number;
    userId?: number;
    isCompanyPage?: boolean;
}

export interface UserNotification {
    type: "user";
    firstName: string;
    lastName: string;
    createdAt: string;
    avatarUrl: string;
}

export interface SubscribeToEventAction {
    title: string;
    price: string;
} 