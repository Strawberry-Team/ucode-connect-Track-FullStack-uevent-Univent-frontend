// components/tickets/TicketCreateModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { createEventTicket } from "@/lib/event";
import { Ticket, CreateTicketRequest } from "@/types";
import { z } from "zod";

// Схема валидации для тикета
const ticketCreateZodSchema = z.object({
    title: z.string().min(1, "Title is required"),
    price: z
        .string()
        .min(1, "Price is required")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val > 0, "Price must be a positive number"),
    status: z.enum(["AVAILABLE", "UNAVAILABLE"], { errorMap: () => ({ message: "Status is required" }) }),
    quantity: z
        .string()
        .min(1, "Quantity is required")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val > 0, "Quantity must be a positive number"),
});

// Типы пропсов для модалки
type TicketCreateModalProps = {
    eventId: number;
    isOpen: boolean;
    onClose: () => void;
    onTicketCreated: (newTickets: Ticket[]) => void;
};

export default function TicketCreateModal({
                                              eventId,
                                              isOpen,
                                              onClose,
                                              onTicketCreated,
                                          }: TicketCreateModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        status: "",
        quantity: "",
    });
    const [displayPrice, setDisplayPrice] = useState(""); // Для отображения с $
    const [errors, setErrors] = useState<{
        title?: string;
        price?: string;
        status?: string;
        quantity?: string;
    }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Синхронизируем displayPrice с formData.price
    useEffect(() => {
        if (formData.price) {
            setDisplayPrice(`${formData.price}$`);
        } else {
            setDisplayPrice("");
        }
    }, [formData.price]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === "price") {
            // Извлекаем только числовую часть, удаляя $ и другие нечисловые символы
            const numericValue = value.replace(/[^0-9.]/g, "");
            setFormData((prev) => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleStatusChange = (value: string) => {
        setFormData((prev) => ({ ...prev, status: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const ticketData = {
            title: formData.title.trim(),
            price: formData.price,
            status: formData.status,
            quantity: formData.quantity,
        };

        const validation = ticketCreateZodSchema.safeParse(ticketData);
        if (!validation.success) {
            const validationErrors = validation.error.flatten().fieldErrors;
            setErrors({
                title: validationErrors.title?.[0],
                price: validationErrors.price?.[0],
                status: validationErrors.status?.[0],
                quantity: validationErrors.quantity?.[0],
            });
            const errorMessages = Object.values(validationErrors)
                .filter((error): error is string[] => error !== undefined)
                .flatMap((error) => error);
            showErrorToasts(errorMessages);
            return;
        }

        setErrors({});

        setIsSubmitting(true);
        const requestData: CreateTicketRequest = {
            title: formData.title.trim(),
            price: Number(formData.price),
            status: formData.status as "AVAILABLE" | "UNAVAILABLE",
            quantity: Number(formData.quantity),
        };

        const result = await createEventTicket(eventId, requestData);
        if (result.success && result.data) {
            showSuccessToast("Ticket created successfully");
            onTicketCreated(Array.isArray(result.data) ? result.data : [result.data]);
            onClose();
        } else {
            showErrorToasts(result.errors);
        }

        setIsSubmitting(false);
    };

    const handleClose = () => {
        setFormData({
            title: "",
            price: "",
            status: "",
            quantity: "",
        });
        setErrors({});
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="w-[500px] bg-white rounded-lg shadow-lg">
                <DialogTitle className="sr-only">Create a New Ticket</DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4 px-2">
                    {/* Title */}
                    <div className="space-y-2">
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Title (e.g., VIP Ticket)"
                            className="!text-[15px] w-full mt-3 rounded-md"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Price and Quantity in one row */}
                    <div className="flex gap-2 space-y-2">
                        <div className="flex-1 space-y-2">
                            <Input
                                id="price"
                                name="price"
                                step="0.01"
                                value={displayPrice} // Используем displayPrice для отображения с $
                                onChange={handleInputChange}
                                placeholder="Price (e.g., 99.99$)"
                                className="!text-[15px] w-full rounded-md"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Input
                                id="quantity"
                                name="quantity"

                                value={formData.quantity}
                                onChange={handleInputChange}
                                placeholder="Quantity (e.g., 100)"
                                className="!text-[15px] w-full rounded-md"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Select
                            value={formData.status}
                            onValueChange={handleStatusChange}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="cursor-pointer !text-[15px] w-full rounded-md">
                                <SelectValue placeholder="Status (e.g., Available)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className="cursor-pointer" value="AVAILABLE">
                                    Available
                                </SelectItem>
                                <SelectItem className="cursor-pointer" value="UNAVAILABLE">
                                    Unavailable
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            !formData.title ||
                            !formData.price ||
                            !formData.status ||
                            !formData.quantity
                        }
                        className="w-full"
                    >
                        {isSubmitting ? "Submitting..." : "Create Ticket"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}