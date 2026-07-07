export type ProgramSlotType = 'PRESENTATION' | 'BREAK' | 'WORKSHOP' | 'QA' | 'KEYNOTE';

export interface EventProgram {
  id: number;
  eventId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  orderIndex: number;
  type: ProgramSlotType;
  speakerId?: number | null;
  speakerName?: string | null;
  speakerTitle?: string | null;
  speakerCompany?: string | null;
  speakerPhotoUrl?: string | null;
  speakerLinkedinUrl?: string | null;
}

export interface EventProgramRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  orderIndex?: number;
  type?: ProgramSlotType;
  speakerId?: number | null;
}
