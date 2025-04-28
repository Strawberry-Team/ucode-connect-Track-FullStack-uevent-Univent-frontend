"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import BuyTicketModal from "./buy-ticket-modal";
import { TicketActionsProps } from "@/types/ticket";

export default function TicketActions({ 
    eventId,
    eventTitle,
    eventType,
}: TicketActionsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button 
                className="flex items-center gap-2 text-[16px] py-5 px-7 rounded-full font-medium mt-1 w-[200px]"
                onClick={() => setIsModalOpen(true)}
            >
                <Ticket className="w-5 h-5" />
                Buy Tickets
            </Button>

            <BuyTicketModal
                eventId={eventId.toString()}
                eventTitle={eventTitle}
                eventType={eventType}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}