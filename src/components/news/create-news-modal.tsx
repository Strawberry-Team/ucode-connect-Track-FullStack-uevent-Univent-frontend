// components/news/CreateNewsModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { createCompanyNews } from "@/lib/company";
import { createEventNews } from "@/lib/event";
import { updateNews } from "@/lib/news";
import { useAuth } from "@/context/auth-context";
import { z } from "zod";
import { CompanyNews, NewsItem } from "@/types";

// Схема валидации для новости
const newsCreateZodSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long").max(100, "Title must not exceed 100 characters"),
    description: z.string().min(20, "Description must be at least 20 characters long").max(5000, "Description must not exceed 5000 characters"),
});

// Типы
interface CreateNewsModalProps {
    companyId?: number; // Опционально для компании
    eventId?: number;   // Опционально для события
    newsToEdit?: CompanyNews | NewsItem | null; // Данные новости для редактирования
    isOpen: boolean;
    onClose: () => void;
    onNewsCreated: (newNews: CompanyNews | NewsItem) => void;
    onNewsUpdated: (updatedNews: CompanyNews | NewsItem) => void; // Новый коллбэк для обновления
}

export default function CreateNewsModal({
                                            companyId,
                                            eventId,
                                            newsToEdit,
                                            isOpen,
                                            onClose,
                                            onNewsCreated,
                                            onNewsUpdated,
                                        }: CreateNewsModalProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });
    const [newsErrors, setNewsErrors] = useState<{
        title?: string;
        description?: string;
    }>({});
    const [isLoading, setIsLoading] = useState(false);

    // Проверяем, что передан либо companyId, либо eventId, но не оба
    if (companyId !== undefined && eventId !== undefined) {
        throw new Error("Cannot provide both companyId and eventId");
    }
    if (companyId === undefined && eventId === undefined) {
        throw new Error("Either companyId or eventId must be provided");
    }

    // Заполняем поля данными из newsToEdit при открытии модального окна
    useEffect(() => {
        if (isOpen && newsToEdit) {
            setFormData({
                title: newsToEdit.title,
                description: newsToEdit.description,
            });
        }
    }, [isOpen, newsToEdit]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newsData = {
            title: formData.title,
            description: formData.description,
        };

        const validation = newsCreateZodSchema.safeParse(newsData);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            setNewsErrors({
                title: errors.title?.[0],
                description: errors.description?.[0],
            });
            const errorMessages = Object.values(errors)
                .filter((error): error is string[] => error !== undefined)
                .flatMap((error) => error);
            showErrorToasts(errorMessages);
            return;
        }

        setNewsErrors({});

        if (!user?.id) return;

        setIsLoading(true);
        try {
            if (newsToEdit) {
                // Режим редактирования
                const updateResult = await updateNews(newsToEdit.id, newsData);
                if (!updateResult?.success || !updateResult.data) {
                    showErrorToasts(updateResult?.errors || ["Failed to update news"]);
                    return;
                }

                const updatedNews = updateResult.data;
                onNewsUpdated(updatedNews);
                showSuccessToast("News updated successfully");
            } else {
                // Режим создания
                let createResult;
                if (companyId !== undefined) {
                    createResult = await createCompanyNews(companyId, newsData);
                } else if (eventId !== undefined) {
                    createResult = await createEventNews(eventId, newsData);
                }

                if (!createResult?.success || !createResult.data) {
                    showErrorToasts(createResult?.errors || ["Failed to create news"]);
                    return;
                }

                const newNews = createResult.data;
                onNewsCreated(newNews);
                showSuccessToast("News created successfully");
            }

            setFormData({
                title: "",
                description: "",
            });
            onClose();
        } catch (error: any) {
            showErrorToasts(error.errors || ["Failed to create or update news"]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            title: "",
            description: "",
        });
        setNewsErrors({});
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="w-[500px] bg-white rounded-lg shadow-lg">
                <DialogTitle className="sr-only">
                    {newsToEdit ? "Edit News" : "Create a New News"}
                </DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4 px-2">
                    {/* Заголовок */}
                    <div className="space-y-2">
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="News Title"
                            className="!text-[15px] w-full mt-3 rounded-md"
                            disabled={isLoading}
                        />
                        {newsErrors.title && (
                            <p className="text-sm text-red-500">{newsErrors.title}</p>
                        )}
                    </div>

                    {/* Описание */}
                    <div className="space-y-2">
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter the news description..."
                            className="!text-[15px] w-full rounded-md min-h-[200px]"
                            disabled={isLoading}
                        />
                        {newsErrors.description && (
                            <p className="text-sm text-red-500">{newsErrors.description}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            isLoading ||
                            !formData.title ||
                            !formData.description
                        }
                        className="w-full"
                    >
                        {isLoading ? "Loading..." : newsToEdit ? "Update News" : "Create News"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}