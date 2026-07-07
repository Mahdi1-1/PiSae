export type EventType = 'WEBINAIRE' | 'WORKSHOP' | 'PITCH' | 'BOOTCAMP' | 'CONFERENCE';
export type EventStatus =
  | 'BROUILLON'
  | 'EN_ATTENTE_VALIDATION'
  | 'APPROUVE'
  | 'PUBLIE'
  | 'REJETE'
  | 'INSCRIPTIONS'
  | 'EN_COURS'
  | 'TERMINE'
  | 'ANNULE'
  | 'ARCHIVE';
export type LocationType = 'PRESENTIEL' | 'DISTANCIEL' | 'HYBRIDE';

export interface Event {
  id: number;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string | null;
  locationType: LocationType;
  location: string | null;
  ticketPrice: number | null;
  capacityMax: number | null;
  availablePlaces: number | null;
  isFull: boolean;
  registeredCount: number;
  coverImageUrl: string | null;
  targetSector: string[];
  targetStage: string[];
  organizerId: number;
  organizerRole: string;
  organizerName: string | null;
  organizerEmail: string | null;
  createdAt: string;
  rejectionReason: string | null;
  validatedBy: number | null;
  validatedAt: string | null;
  submittedAt: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface EventRequest {
  title: string;
  description: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  locationType: LocationType;
  location?: string;
  ticketPrice?: number;
  capacityMax: number;
  coverImageUrl?: string;
  targetSector: string[];
  targetStage: string[];
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  type?: EventType;
  status?: EventStatus;
  startDate?: string;
  endDate?: string;
  locationType?: LocationType;
  location?: string;
  ticketPrice?: number;
  capacityMax?: number;
  coverImageUrl?: string;
  targetSector?: string[];
  targetStage?: string[];
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface EventMapMarker {
  id: number;
  title: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  address: string | null;
  latitude: number;
  longitude: number;
  coverImage: string | null;
}

export interface DayGroup {
  label: string;
  date: Date;
  events: Event[];
}
