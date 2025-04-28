export interface NotificationEvent {
    id: number;
    title: string;
    logoName: string | null;
}

export interface NotificationCompany {
    id: number;
    title: string;
    logoName: string | null;
}

export interface Notification {
    id: number;
    userId: number;
    eventId: number | null;
    companyId: number | null;
    title: string;
    content: string;
    readAt: string | null;
    hiddenAt: string | null;
    createdAt: string;
    event?: NotificationEvent;
    company?: NotificationCompany;
}

export interface NotificationsResponse {
    notifications: Notification[];
}

export interface NotificationListProps {
    notifications: Notification[];
}

export interface NotificationButtonProps {
    unreadCount?: number;
    onClick?: () => void;
    notifications?: Notification[];
    onUpdate: () => void;
}

export interface UpdateAllNotificationsResponse {
    updatedCount: number;
} 