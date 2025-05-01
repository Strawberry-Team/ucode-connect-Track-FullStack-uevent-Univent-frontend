import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import { ApiResponse } from "@/types/common";
import { Order } from "@/types/order";

export async function getOrderById(orderId: number): Promise<ApiResponse<Order>> {
    return executeApiRequest<Order>(
        () => api.get(`/orders/${orderId}`),
        `Failed to fetch order with ID ${orderId}`
    );
}

export async function getOrderItemTicket(orderId: number, itemId: number): Promise<ApiResponse<Blob>> {
    return executeApiRequest<Blob>(
        () => api.get(`/orders/${orderId}/items/${itemId}/ticket`, { responseType: 'blob' }),
        `Failed to fetch ticket PDF for order ${orderId}, item ${itemId}`
    );
}
