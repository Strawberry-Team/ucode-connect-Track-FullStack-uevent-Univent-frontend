import { ApiResponse } from "@/types/common";
import { Company } from "@/types/company";
import { PaymentIntent } from "@/types/payment";
import api from "./api";
import { executeApiRequest } from "@/utils/api-request";

// export const paymentService = {
// // Update an existing promo code
//     async createPaymentIntent(orderId: number) {
//         try {
//             const response = await axios.post(`${API_URL}/payments/stripe/payment-intents`, {orderId}, getAuthHeaders());
//             return response.data;
//         } catch (error) {
//             console.error('Error updating promo code:', error);
//             throw error;
//         }
//     },
// };

export async function createPaymentIntent(orderId: number): Promise<ApiResponse<PaymentIntent>> {
    return executeApiRequest<PaymentIntent>(
        () => api.post(`/payments/stripe/payment-intents`, { orderId }), 
        `Failed to create payment intent for order id ${orderId}`);
}