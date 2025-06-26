"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getOrderItemTicket } from '@/lib/orders';
import { showErrorToasts } from '@/lib/toast';

export default function TicketPage() {
    const { id, itemId } = useParams();

    useEffect(() => {
        const fetchAndOpenTicket = async () => {
            try {
                const response = await getOrderItemTicket(Number(id), Number(itemId));
                if (response.success && response.data) {
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    window.URL.revokeObjectURL(url);
                } else {
                    showErrorToasts(['Failed to load ticket PDF']);
                }
            } catch (error) {
                showErrorToasts(['Error fetching ticket PDF']);
            } finally {
                window.history.back();
            }
        };

        fetchAndOpenTicket();
    }, [id, itemId]);

    return (
        <div>
        </div>
    );
}