// Correspond à org.example.suiviservice.Enum.StatutAvis (backend)
export type StatutAvis = 'PUBLIE' | 'SIGNALE' | 'MASQUE';

// Correspond à AvisResponse (backend)
export interface Avis {
  id: number;
  apprenantId: number;
  formationId: number;
  note: number; // 1-5
  commentaire: string | null;
  dateCreation: string; // ISO LocalDateTime
  statut: StatutAvis;
}

// Correspond à AvisRequest (backend) — le statut n'est jamais envoyé (toujours PUBLIE à la création)
export interface AvisRequest {
  apprenantId: number;
  formationId: number;
  note: number;
  commentaire?: string | null;
}

// Correspond à AvisModerationRequest (backend)
export interface AvisModerationRequest {
  statut: StatutAvis;
}

// Correspond à AvisStatsResponse (backend)
export interface AvisStats {
  formationId: number;
  noteMoyenne: number;
  nombreAvis: number;
  // Clé = note (1 à 5), valeur = nombre d'avis avec cette note. Toutes les clés 1..5
  // sont garanties présentes côté backend, même à 0.
  repartitionNotes: Record<number, number>;
}
