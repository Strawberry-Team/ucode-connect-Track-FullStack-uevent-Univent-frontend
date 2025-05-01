'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getOrderItemTicket } from '@/lib/orders';
import { showErrorToasts } from '@/lib/toast';

export default function TicketPage() {
    const { id, itemId } = useParams(); // Получаем параметры из URL

    useEffect(() => {
        const fetchAndOpenTicket = async () => {
            try {
                const response = await getOrderItemTicket(Number(id), Number(itemId));
                if (response.success && response.data) {
                    // Создаём URL для Blob и открываем PDF в новой вкладке
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    window.URL.revokeObjectURL(url); // Очищаем URL после использования
                } else {
                    showErrorToasts(['Failed to load ticket PDF']);
                }
            } catch (error) {
                showErrorToasts(['Error fetching ticket PDF']);
            } finally {
                // После открытия PDF можно закрыть страницу или перенаправить назад
                window.history.back();
            }
        };

        fetchAndOpenTicket();
    }, [id, itemId]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading ticket...</p>
        </div>
    );
}