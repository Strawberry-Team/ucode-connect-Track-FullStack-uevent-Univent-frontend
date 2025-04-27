// components/news/NewsCard.tsx
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedButton from "@/components/ui/animated-button";
import CreateNewsModal from "@/components/news/create-news-modal";
import { Calendar, CalendarDays, Plus, Pencil } from "lucide-react";
import { getCompanyNewsById } from "@/lib/company";
import { getEventByIdNews } from "@/lib/event";
import { showErrorToasts } from "@/lib/toast";
import { CompanyNews, NewsItem } from "@/types";

// Типы пропсов
type NewsCardProps = {
    companyId?: number; // Опционально для компании
    eventId?: number;   // Опционально для события
};

// Компонент карточки новостей
export default function NewsCard({ companyId, eventId }: NewsCardProps) {
    const [news, setNews] = useState<(CompanyNews | NewsItem)[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingNews, setEditingNews] = useState<CompanyNews | NewsItem | null>(null); // Состояние для редактируемой новости

    // Проверяем, что передан либо companyId, либо eventId, но не оба
    if (companyId !== undefined && eventId !== undefined) {
        throw new Error("Cannot provide both companyId and eventId");
    }
    if (companyId === undefined && eventId === undefined) {
        throw new Error("Either companyId or eventId must be provided");
    }

    // Загрузка новостей
    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            const start = Date.now();
            let result;

            if (companyId !== undefined) {
                result = await getCompanyNewsById(companyId);
            } else if (eventId !== undefined) {
                result = await getEventByIdNews(eventId);
            }

            if (result?.success && result.data) {
                const sortedNews = result.data.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setNews(sortedNews);
            } else {
                setNews([]);
                showErrorToasts(result?.errors || ["Failed to fetch news"]);
            }

            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            setIsLoading(false);
        };
        fetchNews();
    }, [companyId, eventId]);

    // Обработчик создания новости
    const handleNewsCreated = (newNews: CompanyNews | NewsItem) => {
        setNews((prev) =>
            [...prev, newNews].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
        );
    };

    // Обработчик обновления новости
    const handleNewsUpdated = (updatedNews: CompanyNews | NewsItem) => {
        setNews((prev) => {
            const updatedNewsList = prev.map((newsItem) =>
                newsItem.id === updatedNews.id ? updatedNews : newsItem
            );
            // Сортируем по дате создания (от новых к старым)
            return updatedNewsList.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        });
    };

    return (
        <>
            <Card className="flex h-[246px] flex-col shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                    <div className="-mt-2 flex items-center justify-between border-b pb-1 text-xl font-medium text-foreground">
                        <div className="flex items-center">
                            <Calendar strokeWidth={2.5} className="mr-2 h-5 w-5 text-gray-500" />
                            News
                        </div>
                        {!isLoading && news.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setEditingNews(null); // Сбрасываем редактируемую новость
                                    setIsModalOpen(true);
                                }}
                            >
                                <div className="flex items-center gap-1 text-[15px]">
                                    <Plus strokeWidth={2.5} className="h-5 w-5" />
                                    Add news
                                </div>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="-mt-5 flex-1">
                    {isLoading ? (
                        <div className="max-h-[160px] overflow-y-auto px-3 pt-4 custom-scroll">
                            {Array.from({ length: 1 }).map((_, index) => (
                                <div key={index} className="flex flex-col">
                                    <div className="flex items-center justify-between rounded-lg px-2">
                                        <div className="flex items-center gap-4 rounded-lg py-1">
                                            <div className="mt-1 flex flex-col">
                                                <Skeleton className="h-[24px] w-[150px]" />
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Skeleton className="h-[16px] w-[100px]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : news.length > 0 ? (
                        <div className="max-h-[160px] overflow-y-auto px-3 pt-3 custom-scroll">
                            {news.map((newsItem, index) => (
                                <div key={newsItem.id} className="flex flex-col">
                                    <div className="flex items-center justify-between rounded-lg px-2 transition-all duration-500 hover:shadow-[0_0_15px_rgba(0,0,0,0.15)]">
                                            <div className="flex items-center gap-4 rounded-lg py-1 transition-all">
                                                <div className="flex flex-col">
                                                    <h4
                                                        className="text-[20px] -mt-1 font-medium text-gray-800"
                                                        style={{
                                                            maxWidth: "200px",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                        }}
                                                    >
                                                        {newsItem.title}
                                                    </h4>
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <CalendarDays strokeWidth={2.5} className="h-3 w-3" />
                                                        <span className="text-[12px]">
                                                            {format(new Date(newsItem.createdAt), "MMMM d, yyyy")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingNews(newsItem);
                                                setIsModalOpen(true);
                                            }}
                                            className="h-10 w-10"
                                        >
                                            <Pencil strokeWidth={2.5} className="!h-5 !w-5" />
                                        </Button>
                                    </div>
                                    <div className="my-2">
                                        {index < news.length - 1 && <hr className="border-gray-200" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <AnimatedButton
                                title="Create news"
                                onClick={() => {
                                    setEditingNews(null); // Сбрасываем редактируемую новость
                                    setIsModalOpen(true);
                                }}
                                isClicked={isClicked}
                                setIsClicked={setIsClicked}
                                topLeftHover={{ left: 4.5, top: 2.4 }}
                                topRightHover={{ right: 4, top: 2.4 }}
                                bottomLeftHover={{ left: 4.5, bottom: 2.4 }}
                                bottomRightHover={{ right: 4, bottom: 2.4 }}
                                centerPadding={{ left: 4.5, top: 2.4, right: 4, bottom: 2.4 }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <CreateNewsModal
                companyId={companyId}
                eventId={eventId}
                newsToEdit={editingNews} // Передаем редактируемую новость
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsClicked(false);
                    setEditingNews(null); // Сбрасываем редактируемую новость при закрытии
                }}
                onNewsCreated={handleNewsCreated}
                onNewsUpdated={handleNewsUpdated} // Передаем обработчик обновления
            />
        </>
    );
}