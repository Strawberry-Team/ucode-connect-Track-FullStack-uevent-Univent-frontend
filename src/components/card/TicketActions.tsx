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
            className="text-[16px] py-5 px-7 rounded-full font-medium mt-1 w-[250px]"
            onClick={handleBuy}
        >
            Buy
        </Button>
    );
}