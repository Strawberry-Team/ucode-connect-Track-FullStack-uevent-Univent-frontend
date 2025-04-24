import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import {ApiResponse, PromoCode, UpdatePromoCodeRequest} from "@/types";

export async function updatePromoCode(promoCodeId: number, promoCodeData: UpdatePromoCodeRequest): Promise<ApiResponse<PromoCode>> {
    return executeApiRequest<PromoCode>(() => api.patch(`/promo-codes/${promoCodeId}`, promoCodeData), `Failed to update promo code with ID ${promoCodeId}`);
}
