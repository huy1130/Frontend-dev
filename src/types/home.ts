export interface ProcessStep {
  id: number;
  stepNumber: string;
  title: string;
  description: string;
  iconName: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  highlightText?: string;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  avatarUrl: string;
  carModel: string;
  rating: number;
  comment: string;
  date: string;
  branchName: string;
}
