// components/promo-codes/PromoCodeCreateModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { createEventPromoCode } from "@/lib/event";
import { updatePromoCode } from "@/lib/promo-codes";
import { PromoCode, CreatePromoCodeRequest } from "@/types";
import { z } from "zod";

// Схема валидации для промокода
const promoCodeZodSchema = z.object({
    title: z.string().min(1, "Title is required"),
    code: z.string().min(1, "Code is required").optional(),
    discountPercent: z
        .string()
        .min(1, "Discount percent is required")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val > 0 && val <= 100, "Discount must be a number between 1 and 100"),
    isActive: z.boolean(),
});

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
    const [formData, setFormData] = useState({
        title: promoCodeToEdit?.title || "",
        code: promoCodeToEdit?.code || "",
        discountPercent: promoCodeToEdit?.discountPercent
            ? String(promoCodeToEdit.discountPercent * 100)
            : "",
        isActive: promoCodeToEdit?.isActive || false,
    });
    const [displayDiscountPercent, setDisplayDiscountPercent] = useState("");
    const [errors, setErrors] = useState<{
        title?: string;
        code?: string;
        discountPercent?: string;
    }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (formData.discountPercent) {
            setDisplayDiscountPercent(`${formData.discountPercent}%`);
        } else {
            setDisplayDiscountPercent("");
        }
    }, [formData.discountPercent]);

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                title: "",
                code: "",
                discountPercent: "",
                isActive: false,
            });
            setErrors({});
        } else if (promoCodeToEdit) {
            setFormData({
                title: promoCodeToEdit.title,
                code: promoCodeToEdit.code || "",
                discountPercent: String(promoCodeToEdit.discountPercent * 100),
                isActive: promoCodeToEdit.isActive,
            });
        }
    }, [isOpen, promoCodeToEdit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "discountPercent") {
            const numericValue = value.replace(/[^0-9]/g, "");
            setFormData((prev) => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isActive: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const promoCodeData = {
            title: formData.title.trim(),
            code: formData.code.trim(),
            discountPercent: formData.discountPercent,
            isActive: formData.isActive,
        };

        const validationSchema = promoCodeToEdit
            ? promoCodeZodSchema.omit({ code: true })
            : promoCodeZodSchema;
        const validation = validationSchema.safeParse(promoCodeData);
        if (!validation.success) {
            const validationErrors = validation.error.flatten().fieldErrors;
            setErrors({
                title: validationErrors.title?.[0],
                discountPercent: validationErrors.discountPercent?.[0],
            });
            const errorMessages = Object.values(validationErrors)
                .filter((error): error is string[] => error !== undefined)
                .flatMap((error) => error);
            showErrorToasts(errorMessages);
            return;
        }

        setErrors({});

        setIsSubmitting(true);

        if (promoCodeToEdit) {
            const updatedData = {
                title: formData.title.trim(),
                isActive: formData.isActive,
            };
            const result = await updatePromoCode(promoCodeToEdit.id, updatedData);
            if (result.success && result.data) {
                showSuccessToast("Promo code updated successfully");
                onPromoCodeUpdated(result.data);
                onClose();
            } else {
                showErrorToasts(result.errors || ["Failed to update promo code"]);
            }
        } else {
            const createData: CreatePromoCodeRequest = {
                title: formData.title.trim(),
                code: formData.code.trim(),
                discountPercent: Number(formData.discountPercent) / 100,
                isActive: formData.isActive,
            };
            const result = await createEventPromoCode(eventId, createData);
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

    const handleClose = () => {
        setFormData({
            title: "",
            code: "",
            discountPercent: "",
            isActive: false,
        });
        setErrors({});
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="w-[500px] bg-white rounded-lg shadow-lg">
                <DialogTitle className="sr-only">
                    {promoCodeToEdit ? "Edit Promo Code" : "Create Promo Code"}
                </DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4 px-2">
                    {/* Title */}
                    <div className="space-y-2">
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Title (e.g., For the tech enthusiasts)"
                            className="!text-[15px] w-full mt-3 rounded-md"
                            disabled={isSubmitting}
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500">{errors.title}</p>
                        )}
                    </div>

                    {/* Code (только для создания) */}
                    {!promoCodeToEdit && (
                        <div className="space-y-2">
                            <Input
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                placeholder="Code (e.g., TECH2023)"
                                className="!text-[15px] w-full rounded-md"
                                disabled={isSubmitting}
                            />
                            {errors.code && (
                                <p className="text-sm text-red-500">{errors.code}</p>
                            )}
                        </div>
                    )}

                    {/* Discount Percent */}
                    <div className="space-y-2">
                        <Input
                            id="discountPercent"
                            name="discountPercent"
                            value={displayDiscountPercent}
                            onChange={handleInputChange}
                            placeholder="Discount Percent (e.g., 15%)"
                            className="!text-[15px] w-full rounded-md"
                            disabled={isSubmitting || !!promoCodeToEdit}
                        />
                        {errors.discountPercent && (
                            <p className="text-sm text-red-500">{errors.discountPercent}</p>
                        )}
                    </div>

                    {/* Active Switch */}
                    <div className="flex items-center space-x-2">
                        <span className="text-[15px] text-gray-700">Active</span>
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={handleSwitchChange}
                            disabled={isSubmitting}
                            className={`${
                                formData.isActive ? "!bg-green-500" : "!bg-red-500"
                            } transition-colors duration-200`}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            !formData.title ||
                            (!promoCodeToEdit && !formData.code) ||
                            !formData.discountPercent
                        }
                        className="w-full"
                    >
                        {isSubmitting ? "Submitting..." : promoCodeToEdit ? "Update" : "Create"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}