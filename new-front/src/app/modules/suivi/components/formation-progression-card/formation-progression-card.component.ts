import { Component, Input } from '@angular/core';
import { Progression, StatutProgression } from '../../models/progression.model';

// Composant purement présentationnel : aucune logique de récupération de données ici,
// juste l'affichage d'une progression déjà chargée par le parent (MesFormationsComponent).
@Component({
  selector: 'app-formation-progression-card',
  standalone: false,
  templateUrl: './formation-progression-card.component.html',
  styleUrl: './formation-progression-card.component.css',
})
export class FormationProgressionCardComponent {
  @Input({ required: true }) progression!: Progression;
  @Input({ required: true }) formationNom!: string;

  get statutLabel(): string {
    const labels: Record<StatutProgression, string> = {
      NON_COMMENCE: 'Non commencé',
      EN_COURS: 'En cours',
      TERMINE: 'Terminé',
    };
    return labels[this.progression.statut];
  }

  get statutBadgeClass(): string {
    const classes: Record<StatutProgression, string> = {
      NON_COMMENCE: 'statut-badge--neutral',
      EN_COURS: 'statut-badge--blue',
      TERMINE: 'statut-badge--green',
    };
    return classes[this.progression.statut];
  }
}
