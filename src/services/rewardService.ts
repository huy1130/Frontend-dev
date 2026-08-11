import axiosClient from '../api/axiosClient';

export interface RewardDTO {
  rewardId: number;
  rewardName: string;
  description?: string;
  rewardType: string;
  pointCost: number;
  discountValue?: number;
  serviceId?: number;
  minimumTier: string;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  canRedeem: boolean;
  createdAt?: string;
}

export interface UpsertRewardDTO {
  rewardName: string;
  description?: string;
  rewardType: string;
  pointCost: number;
  discountValue?: number;
  serviceId?: number;
  minimumTier: string;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
}

export const rewardService = {
  getAll: (): Promise<RewardDTO[]> => {
    return axiosClient.get('/admin/rewards');
  },
  
  getById: (rewardId: number): Promise<RewardDTO> => {
    return axiosClient.get(`/admin/rewards/${rewardId}`);
  },

  create: (data: UpsertRewardDTO): Promise<RewardDTO> => {
    return axiosClient.post('/admin/rewards', data);
  },

  update: (rewardId: number, data: UpsertRewardDTO): Promise<void> => {
    return axiosClient.put(`/admin/rewards/${rewardId}`, data);
  },

  deactivate: (rewardId: number): Promise<void> => {
    return axiosClient.patch(`/admin/rewards/${rewardId}/deactivate`);
  }
};
