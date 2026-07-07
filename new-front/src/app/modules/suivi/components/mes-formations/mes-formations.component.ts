import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideLoader } from '@ng-icons/lucide';
import { AuthService } from '../../../../core/services/auth.service';
import { FormationCatalogService } from '../../services/formation-catalog.service';
import { PROGRESSION_SERVICE, ProgressionServiceContract } from '../../services/progression.service';
import { Progression, StatutProgression } from '../../models/progression.model';

type FiltreStatut = 'TOUS' | StatutProgression;

interface FormationCardVm {
  progression: Progression;
  formationNom: string;
}

@Component({
  selector: 'app-mes-formations',
  standalone: false,
  providers: [provideIcons({ lucideLoader })],
  templateUrl: './mes-formations.component.html',
  styleUrl: './mes-formations.component.css',
})
export class MesFormationsComponent implements OnInit {
  cards: FormationCardVm[] = [];
  loading = true;
  error: string | null = null;
  filtreActif: FiltreStatut = 'TOUS';

  readonly filtres: { valeur: FiltreStatut; label: string }[] = [
    { valeur: 'TOUS', label: 'Tous' },
    { valeur: 'EN_COURS', label: 'En cours' },
    { valeur: 'TERMINE', label: 'Terminé' },
  ];

  constructor(
    @Inject(PROGRESSION_SERVICE) private readonly progressionService: ProgressionServiceContract,
    private readonly formationCatalogService: FormationCatalogService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.chargerFormations();
  }

  get cardsFiltrees(): FormationCardVm[] {
    if (this.filtreActif === 'TOUS') return this.cards;
    return this.cards.filter(c => c.progression.statut === this.filtreActif);
  }

  chargerFormations(): void {
    const apprenantId = this.authService.getUserId();
    if (!apprenantId) {
      this.error = 'Utilisateur non identifié.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;
    this.progressionService.getByApprenant(apprenantId).subscribe({
      next: (progressions) => {
        // Ne garde que les lignes "niveau formation" (chapitreId === null) : les lignes
        // niveau chapitre appartiennent à l'onglet "Ma progression" du détail formation,
        // pas à cette liste (sinon une formation apparaîtrait une fois par chapitre).
        this.cards = progressions
          .filter(progression => progression.chapitreId === null)
          .map(progression => ({
            progression,
            formationNom: this.formationCatalogService.getNomOrFallback(progression.formationId),
          }));
        this.loading = false;
        // Nécessaire en zoneless : le delay() RxJS du service mock ne passe pas par une API
        // instrumentée (contrairement à HttpClient en mode réel), donc la vue ne se
        // rafraîchit pas toute seule sans ce markForCheck().
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des formations :', err);
        this.error = 'Impossible de charger vos formations. Vérifiez votre connexion.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  selectionnerFiltre(valeur: FiltreStatut): void {
    this.filtreActif = valeur;
  }
}
