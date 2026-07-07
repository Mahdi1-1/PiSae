// Correspond à org.example.suiviservice.Enum.StatutProgression (backend)
export type StatutProgression = 'NON_COMMENCE' | 'EN_COURS' | 'TERMINE';

// Correspond à ProgressionResponse (backend)
export interface Progression {
  id: number;
  apprenantId: number;
  formationId: number;
  chapitreId: number | null;
  pourcentage: number;
  dateDebut: string; // ISO LocalDateTime
  dateDerniereMaj: string;
  statut: StatutProgression;
}

// Correspond à ProgressionRequest (backend) — le statut n'est jamais envoyé,
// il est recalculé côté serveur à partir du pourcentage.
export interface ProgressionRequest {
  apprenantId: number;
  formationId: number;
  chapitreId?: number | null;
  pourcentage: number;
}

// Correspond à ApprenantResumeResponse (backend)
export interface ApprenantResume {
  apprenantId: number;
  moyennePourcentage: number;
  nombreFormationsTerminees: number;
  tempsTotalPasseSecondes: number;
}

// Correspond à InactiviteResponse (backend)
export interface Inactivite {
  apprenantId: number;
  derniereActivite: string | null;
  nom: string | null;
  prenom: string | null;
  email: string | null;
}
