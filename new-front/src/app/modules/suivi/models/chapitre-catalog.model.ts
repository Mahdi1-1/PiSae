// PLACEHOLDER, même logique que formation-catalog.model.ts : suivi-service ne stocke qu'un
// chapitreId opaque (Long, nullable). Ce modèle sert uniquement à afficher un nom lisible.
export interface ChapitreSummary {
  id: number;
  formationId: number;
  nom: string;
  ordre: number;
}
