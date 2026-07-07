import { Component, EventEmitter, Input, Output } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideStar } from '@ng-icons/lucide';

// Composant purement présentationnel et réutilisable : affichage en lecture seule (liste
// d'avis) ou saisie interactive (formulaire), selon `readonly`.
@Component({
  selector: 'app-star-rating',
  standalone: false,
  providers: [provideIcons({ lucideStar })],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css',
})
export class StarRatingComponent {
  @Input() value = 0;
  @Input() readonly = false;
  @Output() valueChange = new EventEmitter<number>();

  readonly etoiles = [1, 2, 3, 4, 5];

  survolee: number | null = null;

  selectionner(note: number): void {
    if (this.readonly) return;
    this.value = note;
    this.valueChange.emit(note);
  }

  survol(note: number | null): void {
    if (this.readonly) return;
    this.survolee = note;
  }

  estRemplie(note: number): boolean {
    const reference = this.survolee ?? this.value;
    return note <= reference;
  }
}
