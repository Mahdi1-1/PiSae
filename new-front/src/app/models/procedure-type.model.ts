// Ce fichier est conservé pour la compatibilité des imports existants.
// La logique de checklist est désormais dans legal-procedure.model.ts
// ProcedureTypeOverview n'est plus nécessaire (pas de endpoint /procedure-types/overview)

export interface ProcedureChecklistItem {
  code: string;
  label: string;
  description?: string;
  required: boolean;
  uploaded: boolean;
  fileUrl?: string | null;
  documentId?: string | null;
}

export interface ProcedureChecklist {
  procedureId: string;
  procedureType: string;
  items: ProcedureChecklistItem[];
  uploadedCount: number;
  requiredCount: number;
  completionPercentage: number;
}
