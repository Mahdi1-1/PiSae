export interface Certificate {
  id: number;
  userId: number;
  eventId: number;
  recipientName: string;
  eventTitle: string;
  eventDate: string;
  verificationToken: string;
  downloadUrl: string;
  generatedAt: string;
}

export interface VerificationResponse {
  valid: boolean;
  recipientName: string | null;
  eventTitle: string | null;
  eventDate: string | null;
  generatedAt: string | null;
  message: string;
}
