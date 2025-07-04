// components/promo-codes/PromoCodesCard.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedButton from "@/components/ui/animated-button";
import PromoCodeCreateModal from "@/components/promo-code/create-and-update-promo-codes-modal";
import { Percent, Pencil, Plus } from "lucide-react";
import { getEventPromoCodes } from "@/lib/events";
import { showErrorToasts } from "@/lib/toast";
import { PromoCode } from "@/types/promo-code";

// Типы пропсов
type PromoCodesCardProps = {
    eventId: number;
};

// Компонент карточки промокодов
export default function PromoCodesCard({ eventId }: PromoCodesCardProps) {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);

    // Загрузка промокодов
    useEffect(() => {
        const fetchPromoCodes = async () => {
            setIsLoading(true);
            const start = Date.now();
            const result = await getEventPromoCodes(eventId);
            if (result.success && result.data) {
                // Сортируем по discountPercent от меньшего к большему
                const sortedPromoCodes = result.data.sort(
                    (a, b) => a.discountPercent - b.discountPercent
                );
                setPromoCodes(sortedPromoCodes);
            } else {
                setPromoCodes([]);
                showErrorToasts(result.errors || ["Failed to fetch promo codes"]);
            }
            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            setIsLoading(false);
        };
        fetchPromoCodes();
    }, [eventId]);

    // Обработчик создания промокода
    const handlePromoCodeCreated = (newPromoCode: PromoCode) => {
        setPromoCodes((prev) => {
            const updatedPromoCodes = [...prev, newPromoCode];
            // Сортируем по discountPercent от меньшего к большему
            return updatedPromoCodes.sort((a, b) => a.discountPercent - b.discountPercent);
        });
    };

    // Обработчик обновления промокода
    const handlePromoCodeUpdated = (updatedPromoCode: PromoCode) => {
        setPromoCodes((prev) => {
            const updatedPromoCodes = prev.map((promoCode) =>
                promoCode.id === updatedPromoCode.id ? updatedPromoCode : promoCode
            );
            // Сортируем по discountPercent от меньшего к большему
            return updatedPromoCodes.sort((a, b) => a.discountPercent - b.discountPercent);
        });
    };

    return (
        <>
            <Card className="flex h-[246px] flex-col shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                    <div className="-mt-2 flex items-center justify-between border-b pb-1 text-xl font-medium text-foreground">
                        <div className="flex items-center">
                            <Percent strokeWidth={2.5} className="mr-2 h-5 w-5 text-gray-500" />
                            Promo Codes
                        </div>
                        {!isLoading && promoCodes.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setEditingPromoCode(null);
                                    setIsModalOpen(true);
                                }}
                            >
                                <div className="flex items-center gap-1 text-[15px]">
                                    <Plus strokeWidth={2.5} className="h-5 w-5" />
                                    Add promo code
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
                    ) : promoCodes.length > 0 ? (
                        <div className="max-h-[160px] overflow-y-auto px-3 pt-3 pb-3 custom-scroll">
                            {promoCodes.map((promoCode, index) => (
                                <div key={promoCode.id} className="flex flex-col">
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
                                                    {promoCode.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-gray-500 text-[12px]">
                                                    <span>
                                                        Discount: {(promoCode.discountPercent * 100).toFixed(0)}%
                                                    </span>
                                                    <span
                                                        className={`border px-2 rounded-md text-[12px] ${
                                                            promoCode.isActive
                                                                ? "bg-green-100 text-green-700 border-green-300"
                                                                : "bg-red-100 text-red-700 border-red-300"
                                                        }`}
                                                    >
                                                        {promoCode.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingPromoCode(promoCode);
                                                setIsModalOpen(true);
                                            }}
                                            className="h-10 w-10"
                                        >
                                            <Pencil strokeWidth={2.5} className="!h-5 !w-5" />
                                        </Button>
                                    </div>
                                    {index < promoCodes.length - 1 && (
                                        <hr
                                            className="border-gray-200 my-2"
                                            key={`hr-${promoCode.id}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <AnimatedButton
                                title="Create promo code"
                                onClick={() => {
                                    setEditingPromoCode(null);
                                    setIsModalOpen(true);
                                }}
                                isClicked={isClicked}
                                setIsClicked={setIsClicked}
                                topLeftHover={{ left: 2, top: 2.4 }}
                                topRightHover={{ right: 1.5, top: 2.4 }}
                                bottomLeftHover={{ left: 2, bottom: 2.4 }}
                                bottomRightHover={{ right: 1.5, bottom: 2.4 }}
                                centerPadding={{ left: 2, top: 2.4, right: 1.5, bottom: 2.4 }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <PromoCodeCreateModal
                eventId={eventId}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsClicked(false);
                    setEditingPromoCode(null);
                }}
                onPromoCodeCreated={handlePromoCodeCreated}
                onPromoCodeUpdated={handlePromoCodeUpdated}
                promoCodeToEdit={editingPromoCode}
            />
        </>
    );
}