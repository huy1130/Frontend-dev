export interface LoyaltySummaryDTO {
  currentPoints: number;
  currentTier: string;
  totalSpent: number;
  totalVisits: number;
}

export interface PointTransactionDTO {
  transactionId: number;
  bookingId?: number | null;
  points: number;
  transactionType: string;
  expireDate?: string | null;
  createdAt: string;
}

export interface PointTransactionPageDTO {
  items: PointTransactionDTO[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}
