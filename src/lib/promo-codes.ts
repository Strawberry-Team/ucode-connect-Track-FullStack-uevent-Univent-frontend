import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import { ApiResponse } from "@/types/common";
import { PromoCode, UpdatePromoCodeRequest } from "@/types/promo-code";

export async function updatePromoCode(promoCodeId: number, promoCodeData: UpdatePromoCodeRequest): Promise<ApiResponse<PromoCode>> {
    return executeApiRequest<PromoCode>(() => api.patch(`/promo-codes/${promoCodeId}`, promoCodeData), `Failed to update promo code with ID ${promoCodeId}`);
}
