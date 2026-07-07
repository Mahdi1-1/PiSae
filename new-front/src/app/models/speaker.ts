export interface Speaker {
  id: number;
  fullName: string;
  title: string;
  company: string;
  bio: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  eventIds: number[];
}

export interface SpeakerRequest {
  fullName: string;
  title?: string;
  company?: string;
  bio?: string;
  photoUrl?: string;
  linkedinUrl?: string;
}

export interface SpeakerCandidate {
  fullName: string;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  linkedinUrl?: string | null;
}
