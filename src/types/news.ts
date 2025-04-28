export interface NewsItem {
    id: number;
    authorId: number;
    companyId: number | null;
    eventId: number | null;
    title: string;
    description: string;
    createdAt: string;
}

export interface NewsNotification {
    type: "news";
    title: string;
    description: string;
    createdAt: string;
} 

export interface NewsCardProps {
    companyId?: number;
    eventId?: number;
};