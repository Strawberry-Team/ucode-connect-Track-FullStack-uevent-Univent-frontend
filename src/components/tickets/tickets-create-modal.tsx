// components/tickets/TicketCreateModal.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { createEventTicket } from "@/lib/event";
import { Ticket, CreateTicketRequest } from "@/types";

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
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState("");
    const [quantity, setQuantity] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Очищаем поля при закрытии модального окна
    useEffect(() => {
        if (!isOpen) {
            setTitle("");
            setPrice("");
            setStatus("");
            setQuantity("");
            setErrors({});
        }
    }, [isOpen]);

    // Валидация формы
    const validateForm = useCallback(() => {
        const newErrors: { [key: string]: string } = {};

        if (!title.trim()) {
            newErrors.title = "Title is required";
        }
        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
            newErrors.price = "Price must be a positive number";
        }
        if (!status) {
            newErrors.status = "Status is required";
        }
        if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
            newErrors.quantity = "Quantity must be a positive number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [title, price, status, quantity]);

    // Обработчик отправки формы
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        const ticketData: CreateTicketRequest = {
            title: title.trim(),
            price: Number(price),
            status,
            quantity: Number(quantity),
        };

        const result = await createEventTicket(eventId, ticketData);
        if (result.success && result.data) {
            showSuccessToast("Ticket created successfully");
            // Сервер возвращает массив тикетов, передаем его в onTicketCreated
            onTicketCreated(Array.isArray(result.data) ? result.data : [result.data]);
            onClose();
        } else {
            showErrorToasts(result.errors);
        }

        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Ticket</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., VIP Ticket"
                            className={errors.title ? "border-red-500" : ""}
                            disabled={isSubmitting}
                        />
                        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="e.g., 99.99"
                            className={errors.price ? "border-red-500" : ""}
                            disabled={isSubmitting}
                        />
                        {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={setStatus} disabled={isSubmitting}>
                            <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AVAILABLE">Available</SelectItem>
                                <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                    </div>

                    <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="e.g., 100"
                            className={errors.quantity ? "border-red-500" : ""}
                            disabled={isSubmitting}
                        />
                        {errors.quantity && (
                            <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}