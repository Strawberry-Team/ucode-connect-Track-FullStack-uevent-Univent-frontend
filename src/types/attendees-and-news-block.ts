export interface NewsNotification {
    type: "news";
    title: string;
    description: string;
    createdAt: string;
}

export interface UserNotification {
    type: "user";
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    profilePictureName: string;
    isVisible: boolean;
}

export interface CompanyNewsNotification {
    type: "companyNews";
    title: string;
    description: string;
    createdAt: string;
}

export interface EventNotification {
    type: "event";
    title: string;
    createdAt: string;
    avatarUrl: string;
}

export type Notification = NewsNotification | UserNotification | CompanyNewsNotification | EventNotification;

export interface NotificationItemProps {
    notification: Notification;
    isExpanded: boolean;
    isCollapsing: boolean;
    onVisibilityChange: (id: number, isVisible: boolean) => void;
    currentUserId?: number;
}

export interface NotificationsBlockProps {
    notifications?: Notification[];
    eventId?: number;
}
