import axiosClient from '../api/axiosClient';
import { LoyaltySummaryDTO, PointTransactionPageDTO } from '../types/loyalty';

export const loyaltyService = {
  getSummary: (): Promise<LoyaltySummaryDTO> => {
    return axiosClient.get('/loyalty/me/summary');
  },

  getTransactions: (page: number = 1, pageSize: number = 20): Promise<PointTransactionPageDTO> => {
    return axiosClient.get('/loyalty/me/transactions', {
      params: { page, pageSize }
    });
  },

  getEligibleRewards: (): Promise<any[]> => {
    return axiosClient.get('/loyalty/me/rewards');
  },

  redeemReward: (rewardId: number): Promise<any> => {
    // Generate a unique request ID for idempotency
    const requestId = crypto.randomUUID();
    return axiosClient.post(`/loyalty/me/rewards/${rewardId}/redeem`, { requestId });
  },

  getMyRedemptions: (): Promise<any[]> => {
    return axiosClient.get('/loyalty/me/redemptions');
  },
};
