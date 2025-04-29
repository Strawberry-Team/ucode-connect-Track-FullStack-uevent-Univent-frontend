import { PromoCode, PromoCodeDiscount } from './promo-code';

export type OrderItem = {
    id: number;
    finalPrice: number;
    ticket: {
        id: number;
        title: string;
        price: number;
        number: string;
        event: {
            id: number;
            title: string;
            startedAt: string;
            endedAt: string;
            posterName: string;
        };
    };
};

export type Order = {
    id: number;
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    promoCode: PromoCode;
    orderItems: OrderItemInclude[];
}; 

export type Event = {
    id: number;
    title: string;
    startedAt: string;
    endedAt: string;
    venue: string;
    posterName: string;
};

export type Ticket = {
    id: number;
    title: string;
    price: number;
    number: string;
    event: Event;
};

export type OrderItemInclude = {
    id: number;
    finalPrice: number;
    ticket: Ticket;
};

export interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export interface OrderCreateRequest {
    promoCode: string;
    paymentMethod: string;
    eventId: number;
    items: {
        ticketTitle: string;
        quantity: number;
    }[];
}

export interface OrderItemResponse {
    id: number;
    ticketId: number;
    ticketFileKey: string;
    initialPrice: number;
    finalPrice: number;
}

export interface OrderCreateResponse {
    id: number;
    userId: number;
    promoCodeId: number;
    paymentStatus: string;
    paymentMethod: string;
    totalAmount: number;
    createdAt: string;
    orderItems: OrderItemResponse[];
    promoCode: PromoCodeDiscount;
}