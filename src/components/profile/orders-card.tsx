"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Ticket = {
    id: number;
    name: string;
    status: string;
};

type TicketsCardProps = {
    initialTickets: Ticket[];
};

export default function OrdersCard({ initialTickets }: TicketsCardProps) {
    return (
        <Card className="shadow-lg transition-all duration-300 hover:shadow-xl h-[396px] flex flex-col">
            <CardContent className="flex-1">
                <div className="border-b">
                    <CardHeader className="text-xl font-medium text-foreground">Orders</CardHeader>
                </div>
                <div className="mt-4 space-y-3">
                    {initialTickets.length > 0 ? (
                        initialTickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="flex justify-between items-center p-2 border-b border-foreground/10"
                            >
                                <span>{ticket.name}</span>
                                <span
                                    className={
                                        ticket.status === "paid" ? "text-green-500" : "text-yellow-500"
                                    }
                                >
                                    {ticket.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-foreground/60">No tickets available.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}