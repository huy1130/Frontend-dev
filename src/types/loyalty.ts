export interface LoyaltySummaryDTO {
  currentPoints: number;
  currentTier: string;
  totalSpent: number;
  totalVisits: number;
}

export interface PointTransactionDTO {
  id: number;
  customerId: number;
  points: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

export interface PointTransactionPageDTO {
  transactions: PointTransactionDTO[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}
