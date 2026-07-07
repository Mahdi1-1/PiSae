// Correspond à org.example.suiviservice.Enum.RessourceType (backend)
export type RessourceType = 'VIDEO' | 'PDF' | 'QUIZ' | 'ARTICLE';

// Correspond à LogLectureResponse (backend)
export interface LogLecture {
  id: number;
  apprenantId: number;
  formationId: number;
  ressourceId: number;
  ressourceType: RessourceType;
  tempsPasseSecondes: number;
  dateConsultation: string; // ISO LocalDateTime
}

// Correspond à LogLectureRequest (backend) — dateConsultation n'est jamais envoyée,
// fixée à "maintenant" côté serveur à la création.
export interface LogLectureRequest {
  apprenantId: number;
  formationId: number;
  ressourceId: number;
  ressourceType: RessourceType;
  tempsPasseSecondes: number;
}
