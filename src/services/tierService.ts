import axiosClient from '../api/axiosClient';

export interface TierRuleDTO {
  tierRuleId?: number;
  tierName: string;
  rank?: number;
  minimumSpend: number;
  minimumVisits: number;
  qualificationMode: string;
  evaluationPeriodMonths: number;
  bookingWindowDays: number;
  pointMultiplier: number;
  benefitDescription?: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface UpdateTierRuleDTO {
  minimumSpend: number;
  minimumVisits: number;
  qualificationMode: string;
  evaluationPeriodMonths: number;
  bookingWindowDays: number;
  pointMultiplier: number;
  benefitDescription?: string;
  isActive: boolean;
}

export interface TierReviewResultDTO {
  reviewedCustomers?: number;
  upgradedCustomers?: number;
  downgradedCustomers?: number;
  unchangedCustomers?: number;
}

export const tierService = {
  // GET all tier rules
  getAllRules: (): Promise<TierRuleDTO[]> => {
    return axiosClient.get('/admin/tier-rules');
  },

  // PUT update a tier rule by tierName
  updateRule: (tierName: string, data: UpdateTierRuleDTO): Promise<TierRuleDTO> => {
    return axiosClient.put(`/admin/tier-rules/${tierName}`, data);
  },

  // POST run monthly review manually
  runMonthlyReview: (): Promise<TierReviewResultDTO> => {
    return axiosClient.post('/admin/tier-rules/review');
  },
};
