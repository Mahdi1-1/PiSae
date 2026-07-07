// PLACEHOLDER : aucun service "formation" n'existe encore dans le système (ni backend, ni
// frontend) — suivi-service ne stocke qu'un formationId opaque (Long). Ce modèle sert
// uniquement à afficher un nom/une description dans l'UI en attendant un vrai catalogue.
// À supprimer/remplacer le jour où un formation-service réel existe.
export interface FormationSummary {
  id: number;
  nom: string;
  description?: string;
}
