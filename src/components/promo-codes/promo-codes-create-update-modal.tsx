// components/promo-codes/PromoCodeCreateModal.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { createEventPromoCode } from "@/lib/event";
import { updatePromoCode } from "@/lib/promo-codes";
import { PromoCode, CreatePromoCodeRequest } from "@/types";

// Типы пропсов для модалки
type PromoCodeCreateModalProps = {
    eventId: number;
    isOpen: boolean;
    onClose: () => void;
    onPromoCodeCreated: (newPromoCode: PromoCode) => void;
    onPromoCodeUpdated: (updatedPromoCode: PromoCode) => void;
    promoCodeToEdit?: PromoCode | null;
};

export default function PromoCodeCreateModal({
                                                 eventId,
                                                 isOpen,
                                                 onClose,
                                                 onPromoCodeCreated,
                                                 onPromoCodeUpdated,
                                                 promoCodeToEdit,
                                             }: PromoCodeCreateModalProps) {
    const [title, setTitle] = useState(promoCodeToEdit?.title || "");
    const [code, setCode] = useState(promoCodeToEdit?.code || "");
    const [discountPercent, setDiscountPercent] = useState(
        promoCodeToEdit?.discountPercent ? String(promoCodeToEdit.discountPercent * 100) : ""
    );
    const [isActive, setIsActive] = useState(promoCodeToEdit?.isActive || false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Очищаем данные при закрытии модального окна и обновляем при изменении promoCodeToEdit
    useEffect(() => {
        if (!isOpen) {
            // Очищаем поля, когда модалка закрывается
            setTitle("");
            setCode("");
            setDiscountPercent("");
            setIsActive(false);
            setErrors({});
        } else if (promoCodeToEdit) {
            // Обновляем поля, если передан promoCodeToEdit (режим редактирования)
            setTitle(promoCodeToEdit.title);
            setCode(promoCodeToEdit.code || "");
            setDiscountPercent(String(promoCodeToEdit.discountPercent * 100));
            setIsActive(promoCodeToEdit.isActive);
        }
    }, [isOpen, promoCodeToEdit]);

    // Валидация формы
    const validateForm = useCallback(() => {
        const newErrors: { [key: string]: string } = {};

        if (!title.trim()) {
            newErrors.title = "Title is required";
        }
        if (!promoCodeToEdit && !code.trim()) {
            newErrors.code = "Code is required";
        }
        if (
            !discountPercent ||
            isNaN(Number(discountPercent)) ||
            Number(discountPercent) <= 0 ||
            Number(discountPercent) > 100
        ) {
            newErrors.discountPercent = "Discount must be a number between 1 and 100";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [title, code, discountPercent, promoCodeToEdit]);

    // Обработчик отправки формы
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        if (promoCodeToEdit) {
            // Логика редактирования
            const promoCodeData = {
                title: title.trim(),
                isActive,
            };
            const result = await updatePromoCode(promoCodeToEdit.id, promoCodeData);
            if (result.success && result.data) {
                showSuccessToast("Promo code updated successfully");
                onPromoCodeUpdated(result.data);
                onClose();
            } else {
                showErrorToasts(result.errors || ["Failed to update promo code"]);
            }
        } else {
            // Логика создания
            const promoCodeData: CreatePromoCodeRequest = {
                title: title.trim(),
                code: code.trim(),
                discountPercent: Number(discountPercent) / 100,
                isActive,
            };
            const result = await createEventPromoCode(eventId, promoCodeData);
            if (result.success && result.data) {
                showSuccessToast("Promo code created successfully");
                onPromoCodeCreated(result.data);
                onClose();
            } else {
                showErrorToasts(result.errors || ["Failed to create promo code"]);
            }
        }

        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{promoCodeToEdit ? "Edit Promo Code" : "Create Promo Code"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., For the tech enthusiasts"
                            className={errors.title ? "border-red-500" : ""}
                            disabled={isSubmitting}
                        />
                        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    {!promoCodeToEdit && (
                        <div>
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="e.g., TECH2023"
                                className={errors.code ? "border-red-500" : ""}
                                disabled={isSubmitting}
                            />
                            {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code}</p>}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="discountPercent">Discount Percent (%)</Label>
                        <Input
                            id="discountPercent"
                            type="number"
                            step="1"
                            value={discountPercent}
                            onChange={(e) => setDiscountPercent(e.target.value)}
                            placeholder="e.g., 15"
                            className={errors.discountPercent ? "border-red-500" : ""}
                            disabled={isSubmitting || !!promoCodeToEdit}
                        />
                        {errors.discountPercent && (
                            <p className="text-sm text-red-500 mt-1">{errors.discountPercent}</p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Label htmlFor="isActive">Active</Label>
                        <Switch
                            id="isActive"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                            disabled={isSubmitting}
                        />
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
                            {isSubmitting ? "Submitting..." : promoCodeToEdit ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}