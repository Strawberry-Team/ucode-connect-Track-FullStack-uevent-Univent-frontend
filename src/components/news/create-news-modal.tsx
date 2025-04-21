// components/news/CreateNewsModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { createCompanyNews } from "@/lib/company";
import { useAuth } from "@/context/AuthContext";
import { z } from "zod";
import {CompanyNews} from "@/types";

// Схема валидации для новости
const newsCreateZodSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long").max(100, "Title must not exceed 100 characters"),
    description: z.string().min(20, "Description must be at least 20 characters long").max(5000, "Description must not exceed 5000 characters"),
});

// Типы
interface CreateNewsModalProps {
    companyId: number;
    isOpen: boolean;
    onClose: () => void;
    onNewsCreated: (newNews: CompanyNews) => void;
}

export default function CreateNewsModal({
                                            companyId,
                                            isOpen,
                                            onClose,
                                            onNewsCreated,
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
            const createResult = await createCompanyNews(companyId, newsData);
            if (!createResult.success || !createResult.data) {
                showErrorToasts(createResult.errors);
                return;
            }

            const newNews = createResult.data;
            onNewsCreated(newNews);
            showSuccessToast("News created successfully");

            setFormData({
                title: "",
                description: "",
            });
            onClose();
        } catch (error: any) {
            showErrorToasts(error.errors || ["Failed to create news"]);
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
                <DialogTitle className="sr-only">Create a New News</DialogTitle>
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
                        {isLoading ? "Loading..." : "Create News"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}