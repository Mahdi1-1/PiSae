export interface Feedback {
  id: number;
  eventId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  own: boolean;
}

export interface FeedbackRequest {
  rating: number;
  comment: string;
}

export interface FeedbackStats {
  averageRating: number;
  totalCount: number;
  distribution: Record<number, number>; // 1–5 → count
}

export interface FeedbackEligibility {
  canSubmit: boolean;
  hasSubmitted: boolean;
}
