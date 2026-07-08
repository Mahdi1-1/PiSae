import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormationCatalogService } from '../../services/formation-catalog.service';
import { RECOMMENDATION_SERVICE, RecommendationServiceContract } from '../../services/recommendation.service';
import { DifficultyLevel, MatchLevelResponse } from '../../models/recommendation.model';

// Onglet "Mon niveau" : appelle POST /api/recommendation/match-level (suivi-service → ml-service)
// pour comparer le niveau prédit du cours (à partir de ses skills/description) au niveau
// déclaré par l'apprenant. Le service (réel ou mock) ne lève jamais d'erreur métier bloquante :
// en cas d'échec de ml-service, le backend bascule déjà sur un niveau de repli — ici on ne gère
// que les erreurs de transport (ex: gateway injoignable), affichées via erreurMatch.
@Component({
  selector: 'app-formation-niveau',
  standalone: false,
  templateUrl: './formation-niveau.component.html',
  styleUrl: './formation-niveau.component.css',
})
export class FormationNiveauComponent implements OnInit {
  private formationId!: number;

  readonly niveaux: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

  formulaire = new FormGroup({
    learnerLevel: new FormControl<DifficultyLevel>('Beginner', { nonNullable: true }),
  });

  resultat: MatchLevelResponse | null = null;
  loadingMatch = false;
  erreurMatch: string | null = null;
  private dejaVerifie = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly formationCatalogService: FormationCatalogService,
    @Inject(RECOMMENDATION_SERVICE) private readonly recommendationService: RecommendationServiceContract,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.formationId = Number(this.route.parent?.snapshot.paramMap.get('formationId'));
  }

  verifierNiveau(): void {
    const formation = this.formationCatalogService.getById(this.formationId);

    this.loadingMatch = true;
    this.erreurMatch = null;
    this.dejaVerifie = true;

    this.recommendationService.matchLevel({
      skills: formation?.skills,
      description: formation?.description,
      learnerLevel: this.formulaire.controls.learnerLevel.value,
    }).subscribe({
      next: (reponse) => {
        this.resultat = reponse;
        this.loadingMatch = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur lors de la vérification du niveau :', err);
        this.erreurMatch = 'Impossible de vérifier votre niveau pour cette formation pour le moment.';
        this.loadingMatch = false;
        this.cdr.markForCheck();
      },
    });
  }

  get aDejaVerifie(): boolean {
    return this.dejaVerifie;
  }

  libelleNiveau(niveau: DifficultyLevel | null): string {
    switch (niveau) {
      case 'Beginner': return 'Débutant';
      case 'Intermediate': return 'Intermédiaire';
      case 'Advanced': return 'Avancé';
      default: return 'Inconnu';
    }
  }

  libelleSource(source: MatchLevelResponse['source']): string {
    switch (source) {
      case 'ML_PREDICTION': return 'Niveau estimé automatiquement à partir du contenu du cours';
      case 'DECLARED_LEVEL_FALLBACK': return 'Niveau déclaré du cours (estimation automatique indisponible)';
      default: return 'Niveau indéterminé';
    }
  }

  // Score en % pour l'affichage (matchScore backend est déjà entre 0 et 1).
  scorePourcent(score: number | null): number {
    return score === null ? 0 : Math.round(score * 100);
  }
}
