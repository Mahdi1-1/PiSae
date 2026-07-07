export type BadgeType =
  | 'PARTICIPATION'
  | 'SERIE_COMPLETION'
  | 'LEAN_STARTUP_PRACTITIONER'
  | 'INNOVATION_CHAMPION'
  | 'NETWORKING_PRO';

export interface Badge {
  id: number;
  userId: number;
  eventId: number | null;
  eventTitle: string | null;
  type: BadgeType;
  label: string;
  earnedAt: string;
  seriesTag: string | null;
  hasImage: boolean;
}
