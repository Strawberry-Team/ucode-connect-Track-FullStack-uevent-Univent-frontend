"use client";

import { Button } from "@/components/ui/button";

interface TicketActionsProps {
    title: string;
    price: string;
}

export default function TicketActions({ title, price }: TicketActionsProps) {
    const handleBuy = () => {
        alert(`Purchasing ${title} for ${price}`);
    };

    return (
        <Button
            className="mt-4 w-full md:w-auto"
            onClick={handleBuy}
        >
            Buy
        </Button>
    );
}