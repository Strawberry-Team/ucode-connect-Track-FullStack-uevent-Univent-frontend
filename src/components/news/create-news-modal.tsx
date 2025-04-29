"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { createCompanyNews } from "@/lib/companies";
import { createEventNews } from "@/lib/events";
import { updateNews } from "@/lib/news";
import { useAuth } from "@/context/auth-context";
import { z } from "zod";
import { NewsItem } from "@/types/news";
import { CompanyNews } from "@/types/company";
import {newsCreateZodSchema} from "@/zod/shemas";

interface CreateNewsModalProps {
    companyId?: number;
    eventId?: number;
    newsToEdit?: CompanyNews | NewsItem | null;
    isOpen: boolean;
    onClose: () => void;
    onNewsCreated: (newNews: CompanyNews | NewsItem) => void;
    onNewsUpdated: (updatedNews: CompanyNews | NewsItem) => void;
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

    if (companyId !== undefined && eventId !== undefined) {
        throw new Error("Cannot provide both companyId and eventId");
    }
    if (companyId === undefined && eventId === undefined) {
        throw new Error("Either companyId or eventId must be provided");
    }

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
                const updateResult = await updateNews(newsToEdit.id, newsData);
                if (!updateResult?.success || !updateResult.data) {
                    showErrorToasts(updateResult?.errors || ["Failed to update news"]);
                    return;
                }

                const updatedNews = updateResult.data;
                onNewsUpdated(updatedNews);
                showSuccessToast("News updated successfully");
            } else {
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
                    </div>

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