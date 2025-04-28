import { getCompanyById, getCompanyNewsById } from "@/lib/companies";
import CompanyPage from "@/components/company/company-page";

interface CompanyNewsNotification {
    type: "companyNews";
    title: string;
    description: string;
    createdAt: string;
}

interface EventNotification {
    type: "event";
    title: string;
    createdAt: string;
    avatarUrl: string;
}

export default async function CompanyPageCard({ params }: { params: Promise<{ company_id: string }> }) {
    const resolvedParams = await params;
    const companyId = parseInt(resolvedParams.company_id, 10);

    if (isNaN(companyId) || companyId < 1) {
        return <CompanyPage data={{ error: "Company not found" }} />;
    }

    const companyResponse = await getCompanyById(companyId);
    if (!companyResponse.success || !companyResponse.data) {
        return <CompanyPage data={{ error: `Company not found: ${companyResponse.errors}` }} />;
    }

    const newsResponse = await getCompanyNewsById(companyId);
    const rawCompanyNews = newsResponse.success && newsResponse.data ? newsResponse.data : [];

    const companyNewsNotifications: CompanyNewsNotification[] = rawCompanyNews.map((news) => ({
        type: "companyNews" as const,
        title: news.title,
        description: news.description,
        createdAt: news.createdAt,
    }));

    const rawEventNotifications = [
        {
            id: 1,
            title: "John",
            createdAt: "2025-04-15T10:07:28.000Z",
            avatarUrl: `http://localhost:8080/uploads/event-posters/default-poster.png`,
        },
        {
            id: 2,
            title: "Jane",
            createdAt: "2025-04-15T10:08:00.000Z",
            avatarUrl: `http://localhost:8080/uploads/event-posters/default-poster.png`,
        },
        {
            id: 1,
            title: "John",
            createdAt: "2025-04-15T10:07:28.000Z",
            avatarUrl: `http://localhost:8080/uploads/event-posters/default-poster.png`,
        },
    ];

    const eventNotifications: EventNotification[] = rawEventNotifications.map((event) => ({
        type: "event" as const,
        title: event.title,
        createdAt: event.createdAt,
        avatarUrl: event.avatarUrl,
    }));

    const company = companyResponse.data;

    return (
        <CompanyPage
            data={{
                company,
                companyNewsNotifications,
                eventNotifications,
            }}
        />
    );
}