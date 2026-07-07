export type RegistrationStatus = 'INSCRIT' | 'LISTE_ATTENTE' | 'ANNULE' | 'PRESENT' | 'PAIEMENT_EN_ATTENTE_VALIDATION';
export type PaymentStatus = 'FREE' | 'PENDING' | 'PAID' | 'FAILED';

export interface EventRegistration {
  id: number;
  eventId: number;
  eventTitle: string;
  userId: number;
  userName?: string;
  status: RegistrationStatus;
  attended: boolean;
  checkInTime: string | null;
  registeredAt: string;
  ticketNumber: string | null;
  paymentStatus: PaymentStatus | null;
  numberOfPlaces: number;
}