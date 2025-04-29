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