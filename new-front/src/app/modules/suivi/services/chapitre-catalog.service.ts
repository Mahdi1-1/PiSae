import { Injectable } from '@angular/core';
import { ChapitreSummary } from '../models/chapitre-catalog.model';

// PLACEHOLDER : voir chapitre-catalog.model.ts. Structure générique en 5 étapes, réutilisée
// pour toutes les formations du catalogue — suffisant pour démontrer l'UI de progression par
// chapitre sans avoir à écrire un plan de cours réaliste par formation.
const NOMS_ETAPES = [
  'Introduction',
  'Concepts fondamentaux',
  'Mise en pratique',
  'Cas d\'usage avancés',
  'Évaluation finale',
];

@Injectable({ providedIn: 'root' })
export class ChapitreCatalogService {

  getByFormation(formationId: number): ChapitreSummary[] {
    return NOMS_ETAPES.map((nom, index) => ({
      id: formationId * 100 + index + 1,
      formationId,
      nom,
      ordre: index + 1,
    }));
  }

  getNomOrFallback(formationId: number, chapitreId: number): string {
    const chapitre = this.getByFormation(formationId).find(c => c.id === chapitreId);
    return chapitre?.nom ?? `Chapitre #${chapitreId}`;
  }
}
