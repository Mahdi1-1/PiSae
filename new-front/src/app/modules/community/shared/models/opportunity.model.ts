export type OpportunityType = 'EMPLOI' | 'STAGE' | 'PARTENARIAT' | 'FREELANCE';
export type OpportunityStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'EXPIRED';
export type ApplicationStatus = 'SENT' | 'VIEWED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Opportunity {
  id: string;
  publisherId: string;
  type: OpportunityType;
  title: string;
  description: string;
  skillsRequired: string[];
  sector: string;
  location: string;
  status: OpportunityStatus;
  viewsCount: number;
  applicationsCount: number;
  positionsAvailable: number;
  quizSentCount: number;
  quizCompletedCount: number;
  finalisedCount: number;
  expiresAt: string;
  createdAt: string;
}

export interface OpportunityApplication {
  id: string;
  opportunityId: string;
  candidateId: string;
  cvUrl: string;
  coverLetter: string;
  status: ApplicationStatus;
  quizScore?: number;
  cvScore?: number;
  coverLetterScore?: number;
  quizId?: string;
  appliedAt: string;
}

export interface CreateOpportunityDTO {
  title: string;
  description: string;
  publisherId: string;
  type: string;
  skillsRequired: string[];
  sector: string;
  location: string;
  positionsAvailable?: number;
  expiresAt?: string;
}

export interface ApplyDTO {
  candidateId: string;
  cvUrl?: string;
  coverLetter: string;
}