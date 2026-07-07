export type ProcedureType =
  | 'SARL' | 'SUARL' | 'LABEL_STARTUP'
  | 'PI' | 'FISCALITE' | 'CONFORMITE';

export type ProcedureStatus =
  | 'BROUILLON' | 'EN_COURS' | 'EN_ATTENTE_EXPERT' | 'COMPLETE' | 'REFUSE';

export type DocumentStatus = 'NON_DEPOSE' | 'DEPOSE' | 'VALIDE' | 'REFUSE';
export type AiDecision = 'VALID' | 'REJECTED' | 'REVIEW';

export interface LegalDocumentResponse {
  id: string;
  requirementCode: string;
  documentType: string;
  fileUrl: string;
  status: DocumentStatus;
  uploadedAt: string;
  expiresAt?: string | null;
}

export interface LegalProcedureResponse {
  id: string;
  entrepreneurId: number;
  expertId: number;
  projectName: string;
  procedureType: ProcedureType;
  description?: string | null;
  status: ProcedureStatus;
  remark?: string;
  completionRate: number;
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
  finalDocumentUrl?: string | null;
  finalDocumentGeneratedAt?: string | null;
  documents: LegalDocumentResponse[];
}

export interface LegalProcedureStatsResponse {
  total: number;
  drafts: number;
  inProgress: number;
  waitingExpert: number;
  completed: number;
  rejected: number;
  averageCompletion: number;
  byType: Record<string, number>;
}

export interface CreateLegalProcedureRequest {
  projectName: string;
  procedureType: ProcedureType;
  expertId: number;
}

export interface ExpertDecisionRequest {
  approved: boolean;
  remark?: string | null;
}

export interface ExpertSummary {
  id: number;
  fullName: string;
  email: string;
}

export interface ChecklistItem {
  code: string;
  label: string;
  description?: string;
  required: boolean;
  uploaded: boolean;
  fileUrl?: string | null;
  documentId?: string | null;
}

export interface ChecklistResponse {
  procedureId: string;
  procedureType: ProcedureType;
  items: ChecklistItem[];
  uploadedCount: number;
  requiredCount: number;
  completionPercentage: number;
}

export interface DocumentAiAnalysisResponse {
  documentId: string;
  requirementCode: string;
  fileUrl: string;
  ocrAvailable: boolean;
  extractedTextLength: number;
  extractedTextPreview: string;
  visionAvailable: boolean;
  blurScore?: number | null;
  blurred: boolean;
  detectedExpirationDate?: string | null;
  expired: boolean;
  findings: string[];
}

export interface LegalAiAnalysisResponse {
  procedureId: string;
  decision: AiDecision;
  appliedStatus: ProcedureStatus;
  llmAvailable: boolean;
  remark: string;
  technicalFindings: string[];
  llmFindings: string[];
  documents: DocumentAiAnalysisResponse[];
}

export interface LegalChatRequest {
  procedureId?: string;
  procedureType?: ProcedureType;
  procedureStatus?: ProcedureStatus;
  projectName?: string;
  question: string;
  requiredDocuments: string[];
  uploadedDocuments: string[];
  missingDocuments: string[];
  history: Array<{ role: 'user' | 'assistant'; text: string }>;
}

export interface LegalChatResponse {
  answer: string;
  llmAvailable: boolean;
  disclaimer: string;
}

export const PROCEDURE_TYPE_LABELS: Record<ProcedureType, string> = {
  SARL: 'SARL Incorporation',
  SUARL: 'SUARL Incorporation',
  LABEL_STARTUP: 'Label Startup',
  PI: 'Intellectual Property',
  FISCALITE: 'Tax Support',
  CONFORMITE: 'Compliance',
};

export const PROCEDURE_TYPE_DESCRIPTIONS: Record<ProcedureType, string> = {
  SARL: "Create a Limited Liability Company.",
  SUARL: "Create a Single-Member Limited Liability Company.",
  LABEL_STARTUP: 'Apply for the Startup Label.',
  PI: 'Protect trademarks, inventions, or creative assets.',
  FISCALITE: 'Tax assistance and administrative procedures.',
  CONFORMITE: 'Legal compliance review and corrective actions.',
};

export const STATUS_LABELS: Record<ProcedureStatus, string> = {
  BROUILLON: 'Draft',
  EN_COURS: 'In progress',
  EN_ATTENTE_EXPERT: 'Waiting for expert review',
  COMPLETE: 'Completed',
  REFUSE: 'Rejected',
};
