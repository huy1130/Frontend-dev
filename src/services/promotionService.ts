import axiosClient from '../api/axiosClient';

export interface PromotionDTO {
  promotionId: number;
  promoCode?: string;
  promoName: string;
  description?: string;
  promoType: string;
  targetTier: string;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface UpsertPromotionDTO {
  promoCode?: string;
  promoName: string;
  description?: string;
  promoType: string;
  targetTier: string;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
}

export const promotionService = {
  getEligiblePromotions: (): Promise<PromotionDTO[]> => {
    return axiosClient.get('/loyalty/me/promotions');
  },
  getPublicPromotions: (): Promise<PromotionDTO[]> => {
    return axiosClient.get('/promotions/public');
  },
  
  // Admin Endpoints
  getAllAdmin: (): Promise<PromotionDTO[]> => {
    return axiosClient.get('/admin/promotions');
  },
  
  getByIdAdmin: (promotionId: number): Promise<PromotionDTO> => {
    return axiosClient.get(`/admin/promotions/${promotionId}`);
  },

  createAdmin: (data: UpsertPromotionDTO): Promise<PromotionDTO> => {
    return axiosClient.post('/admin/promotions', data);
  },

  updateAdmin: (promotionId: number, data: UpsertPromotionDTO): Promise<void> => {
    return axiosClient.put(`/admin/promotions/${promotionId}`, data);
  },

  deactivateAdmin: (promotionId: number): Promise<void> => {
    return axiosClient.patch(`/admin/promotions/${promotionId}/deactivate`);
  }
};
