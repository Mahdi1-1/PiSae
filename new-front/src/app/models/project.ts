export type ProjectStatus = 'BROUILLON' | 'EN_COURS' | 'EN_ATTENTE' | 'TERMINE' | 'ANNULE';
export type ProjectPriority = 'BASSE' | 'NORMALE' | 'HAUTE' | 'CRITIQUE';

export interface Project {
  id: number;
  title: string;
  sector?: string;
  stage?: string;
  shortDescription?: string;
  problemSolved?: string;
  revenueModel?: string;
  teamSize?: string;
  hasPitchDeck?: boolean;
  hasBusinessPlan?: boolean;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  budget?: number;
  leaderId: number;
  leaderName?: string;
  teamMemberIds?: number[];
  teamMembers?: TeamMember[];
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  progress?: number;
}

export interface TeamMember {
  id: number;
  userId: number;
  userName: string;
  email: string;
  role: string;
  joinedAt: string;
}

export interface Task {
  id?: number;
  projectId?: number;
  title: string;
  description: string;
  status: 'A_FAIRE' | 'EN_COURS' | 'FAIT' | 'BLOQUE';
  priority: ProjectPriority;
  assignedToId?: number;
  assignedToName?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GeneratedRoadmapStep {
  title: string;
  description: string;
  priority: ProjectPriority;
  dueInDays: number;
  milestone: string;
}

export interface ContextDocument {
  name: string;
  content: string;
  uploadedAt?: string;
  kind?: string;
}

export interface WebPlagiarismSource {
  title: string;
  url: string;
  snippet: string;
  score: number;
}

export interface WebPlagiarismResult {
  ok: boolean;
  score: number;
  message: string;
  sources: WebPlagiarismSource[];
}

export interface MlScoreResult {
  projectId: number;
  score: number;
  confidence: number;
  label: string;
  explanation: string;
  featureBreakdown: Record<string, number>;
  modelVersion: string;
}

export interface MlRoadmapStep {
  id: string;
  title: string;
  description: string;
  phase: string;
  order: number;
  durationWeeks: number;
  ownerHint?: string;
  dependencies: string[];
  confidence: number;
}

export interface MlRoadmapResult {
  projectId: number;
  generationMethod: string;
  summary: string;
  steps: MlRoadmapStep[];
}

export interface MaturityAssessment {
  score: number;
  stage: 'IDEATION' | 'PLANIFIE' | 'EXECUTION' | 'READY_TO_LAUNCH';
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface ProjectFilter {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  search?: string;
  leaderId?: number;
}

export interface EntrepreneurPlaygroundDocument {
  name: string;
  content: string;
  kind?: string;
  uploadedAt?: string;
}

export interface EntrepreneurPlaygroundChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface EntrepreneurPlaygroundSuggestedEdit {
  label: string;
  content: string;
}

export interface EntrepreneurPlaygroundRequest {
  title: string;
  description?: string;
  sector?: string;
  stage?: string;
  budget?: number;
  revenueModel?: string;
  teamSize?: string;
  bmc: string;
  swot: string;
  budgetNotes: string;
  goals: string[];
  documents: EntrepreneurPlaygroundDocument[];
  userMessage?: string;
  documentTitle?: string;
  documentDraft?: string;
  tone?: string;
  conversation?: EntrepreneurPlaygroundChatMessage[];
}

export interface EntrepreneurPlaygroundDimension {
  name: string;
  score: number;
  advice: string;
}

export interface EntrepreneurPlaygroundResult {
  projectId: number;
  overallScore: number;
  strengths: string[];
  gaps: string[];
  improvements: string[];
  dimensions: EntrepreneurPlaygroundDimension[];
  assistantMessage?: string;
  documentTitle?: string;
  documentDraft?: string;
  suggestedEdits?: EntrepreneurPlaygroundSuggestedEdit[];
  conversation?: EntrepreneurPlaygroundChatMessage[];
  mode?: string;
}

export type MentoringRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface MentoringRequest {
  id: string;
  projectId: number;
  projectTitle: string;
  mentorId: number;
  mentorEmail: string;
  mentorName: string;
  message: string;
  status: MentoringRequestStatus;
  createdAt: string;
  respondedAt?: string;
}
