"use client";

import {Button} from "@/components/ui/button";

interface TicketActionsProps {
    title: string;
    price: string;
}

export default function TicketActions({title, price}: TicketActionsProps) {
    const handleBuy = () => {
        alert(`Purchasing ${title} for ${price}`);
    };

    return (
        <div className="flex gap-2">
            <Button
                className="text-[16px] py-5 px-7 rounded-full font-medium mt-1 w-[200px]"
                onClick={handleBuy}
            >
                Buy
            </Button>
            <Button
                variant="outline"
                className="text-[16px] py-5 px-7 rounded-full font-medium mt-1 w-[300px]"
                onClick={handleBuy}
            >
                Subscribe to event notifications
            </Button>
        </div>
    );
}