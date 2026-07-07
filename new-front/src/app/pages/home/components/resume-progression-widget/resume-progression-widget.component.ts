import { ChangeDetectionStrategy, Component, Inject, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { PROGRESSION_SERVICE, ProgressionServiceContract } from '../../../../modules/suivi/services/progression.service';
import { ApprenantResume } from '../../../../modules/suivi/models/progression.model';

// Widget dashboard : résumé de progression de l'apprenant connecté, toutes formations
// confondues. Utilise des signals plutôt que ChangeDetectorRef.markForCheck() — les deux
// fonctionnent en zoneless, mais les signals sont le mécanisme natif recommandé ici,
// cohérent avec le reste de HomeComponent (déjà signal-based).
@Component({
  selector: 'app-resume-progression-widget',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resume-progression-widget.component.html',
  styleUrl: './resume-progression-widget.component.css',
})
export class ResumeProgressionWidgetComponent implements OnInit {
  private readonly authService = inject(AuthService);

  protected resume = signal<ApprenantResume | null>(null);
  // ApprenantResumeResponse (backend) n'expose que nombreFormationsTerminees, pas le nombre
  // "en cours" demandé ici — calculé côté client à partir de getByApprenant(), déjà utilisé
  // par "Mes formations" (même logique de filtre : lignes niveau formation, chapitreId null).
  protected nombreEnCours = signal(0);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  constructor(@Inject(PROGRESSION_SERVICE) private readonly progressionService: ProgressionServiceContract) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    const apprenantId = this.authService.getUserId();
    if (!apprenantId) {
      this.error.set('Utilisateur non identifié.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.progressionService.getResume(apprenantId).subscribe({
      next: (resume) => {
        this.resume.set(resume);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du résumé de progression :', err);
        this.error.set('Impossible de charger votre progression.');
        this.loading.set(false);
      },
    });

    this.progressionService.getByApprenant(apprenantId).subscribe({
      next: (progressions) => {
        const enCours = progressions.filter(p => p.chapitreId === null && p.statut === 'EN_COURS').length;
        this.nombreEnCours.set(enCours);
      },
      error: (err) => console.error('Erreur lors du calcul des formations en cours :', err),
    });
  }

  protected tempsFormate(): string {
    const secondes = this.resume()?.tempsTotalPasseSecondes ?? 0;
    const heures = Math.floor(secondes / 3600);
    const minutes = Math.round((secondes % 3600) / 60);
    if (heures === 0) return `${minutes} min`;
    return minutes > 0 ? `${heures} h ${minutes} min` : `${heures} h`;
  }
}
