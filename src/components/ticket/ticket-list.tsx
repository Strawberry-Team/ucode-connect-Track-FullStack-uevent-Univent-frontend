"use client";

import { useCallback, useEffect, useState } from "react";
import TicketSelector from "./ticket-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { TicketListProps, TicketUniqueType } from '@/types/ticket';
import { getTicketTypes } from "@/lib/tickets";

export default function TicketList({ 
  eventId, 
  onTicketQuantitiesChange, 
  onTicketsLoad, 
  discountPercent = 0 
}: TicketListProps) {
  const [tickets, setTickets] = useState<TicketUniqueType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [typeId: string]: number }>({});

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getTicketTypes(eventId);
      
      if (!response.success) {
        throw new Error(response.errors[0] || "Error loading tickets");
      }

      const items = response.data?.items || [];
      setTickets(items);
      onTicketsLoad?.(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading tickets");
      console.error("Error loading tickets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleQuantityChange = (ticketId: string, quantity: number): void => {
    const newQuantities = {
      ...quantities,
      [ticketId]: quantity,
    };
    setQuantities(newQuantities);
    onTicketQuantitiesChange(newQuantities);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!tickets.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No tickets available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <TicketSelector
          key={ticket.id}
          ticket={ticket}
          discountPercent={discountPercent}
          onQuantityChange={(quantity) => handleQuantityChange(ticket.id, quantity)}
        />
      ))}
    </div>
  );
} 