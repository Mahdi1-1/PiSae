import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideLoader } from '@ng-icons/lucide';
import { AuthService } from '../../../../core/services/auth.service';
import { ChapitreCatalogService } from '../../services/chapitre-catalog.service';
import { LOG_LECTURE_SERVICE, LogLectureServiceContract } from '../../services/log-lecture.service';
import { PROGRESSION_SERVICE, ProgressionServiceContract } from '../../services/progression.service';
import { LogLecture, RessourceType } from '../../models/log-lecture.model';
import { Progression } from '../../models/progression.model';

interface ChapitreVm {
  chapitreId: number;
  nom: string;
  ordre: number;
  pourcentage: number;
}

const RESSOURCE_TYPE_LABELS: Record<RessourceType, string> = {
  VIDEO: 'Vidéo',
  PDF: 'PDF',
  QUIZ: 'Quiz',
  ARTICLE: 'Article',
};

const PAGE_SIZE = 10;

@Component({
  selector: 'app-formation-progression-detail',
  standalone: false,
  providers: [provideIcons({ lucideLoader })],
  templateUrl: './formation-progression-detail.component.html',
  styleUrl: './formation-progression-detail.component.css',
})
export class FormationProgressionDetailComponent implements OnInit {
  private formationId!: number;
  private apprenantId!: number;

  // --- Progression par chapitre ---
  chapitres: ChapitreVm[] = [];
  loadingChapitres = true;
  erreurChapitres: string | null = null;

  // --- Historique de lecture ---
  logs: LogLecture[] = [];
  pageActuelle = 0;
  totalPages = 0;
  loadingLogs = true;
  erreurLogs: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    @Inject(PROGRESSION_SERVICE) private readonly progressionService: ProgressionServiceContract,
    @Inject(LOG_LECTURE_SERVICE) private readonly logLectureService: LogLectureServiceContract,
    private readonly chapitreCatalogService: ChapitreCatalogService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // formationId est porté par la route PARENTE (formation-detail), pas par cette route enfant.
    this.formationId = Number(this.route.parent?.snapshot.paramMap.get('formationId'));
    this.apprenantId = this.authService.getUserId();

    this.chargerChapitres();
    this.chargerLogs(0);
  }

  ressourceTypeLabel(type: RessourceType): string {
    return RESSOURCE_TYPE_LABELS[type];
  }

  formaterTemps(secondes: number): string {
    const minutes = Math.round(secondes / 60);
    if (minutes < 60) return `${minutes} min`;
    const heures = Math.floor(minutes / 60);
    const reste = minutes % 60;
    return reste > 0 ? `${heures} h ${reste} min` : `${heures} h`;
  }

  chargerChapitres(): void {
    this.loadingChapitres = true;
    this.erreurChapitres = null;
    this.progressionService.getByApprenant(this.apprenantId).subscribe({
      next: (progressions: Progression[]) => {
        const catalogue = this.chapitreCatalogService.getByFormation(this.formationId);
        this.chapitres = progressions
          .filter(p => p.formationId === this.formationId && p.chapitreId !== null)
          .map(p => {
            const chapitre = catalogue.find(c => c.id === p.chapitreId);
            return {
              chapitreId: p.chapitreId!,
              nom: chapitre?.nom ?? `Chapitre #${p.chapitreId}`,
              ordre: chapitre?.ordre ?? 0,
              pourcentage: p.pourcentage,
            };
          })
          .sort((a, b) => a.ordre - b.ordre);
        this.loadingChapitres = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la progression par chapitre :', err);
        this.erreurChapitres = 'Impossible de charger la progression par chapitre.';
        this.loadingChapitres = false;
        this.cdr.markForCheck();
      },
    });
  }

  chargerLogs(page: number): void {
    this.loadingLogs = true;
    this.erreurLogs = null;
    this.logLectureService.getByApprenantAndFormation(this.apprenantId, this.formationId, page, PAGE_SIZE).subscribe({
      next: (resultat) => {
        this.logs = resultat.content;
        this.pageActuelle = resultat.number;
        this.totalPages = resultat.totalPages;
        this.loadingLogs = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Erreur lors du chargement de l'historique de lecture :", err);
        this.erreurLogs = "Impossible de charger l'historique de lecture.";
        this.loadingLogs = false;
        this.cdr.markForCheck();
      },
    });
  }

  pagePrecedente(): void {
    if (this.pageActuelle > 0) this.chargerLogs(this.pageActuelle - 1);
  }

  pageSuivante(): void {
    if (this.pageActuelle < this.totalPages - 1) this.chargerLogs(this.pageActuelle + 1);
  }
}
