export type PromoCode = {
    id: number;
    eventId: number;
    title: string;
    code?: string;
    discountPercent: number;
    isActive: boolean;
};

export type CreatePromoCodeRequest = {
    title: string;
    code: string;
    discountPercent: number;
    isActive: boolean;
};

export type UpdatePromoCodeRequest = {
    title: string;
    isActive: boolean;
};

export type ValidPromoCode = {
    promoCode: {
        discountPercent: number;
    }
}

export type InvalidPromoCode = {
    error: string;
    message: string;
    statusCode: number;
} 

export type PromoCodeCreateModalProps = {
    eventId: number;
    isOpen: boolean;
    onClose: () => void;
    onPromoCodeCreated: (newPromoCode: PromoCode) => void;
    onPromoCodeUpdated: (updatedPromoCode: PromoCode) => void;
    promoCodeToEdit?: PromoCode | null;
};

export type PromoCodeDiscount = {
    discountPercent: number;
} | null;