import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AVIS_SERVICE, AvisServiceContract } from '../../services/avis.service';
import { Avis, AvisStats } from '../../models/avis.model';

const COMMENTAIRE_MAX_LENGTH = 500;
const PAGE_SIZE = 10;

@Component({
  selector: 'app-formation-avis',
  standalone: false,
  templateUrl: './formation-avis.component.html',
  styleUrl: './formation-avis.component.css',
})
export class FormationAvisComponent implements OnInit {
  private formationId!: number;
  private apprenantId!: number;

  readonly commentaireMaxLength = COMMENTAIRE_MAX_LENGTH;

  // --- Liste des avis ---
  avis: Avis[] = [];
  pageActuelle = 0;
  totalPages = 0;
  loadingAvis = true;
  erreurAvis: string | null = null;

  // --- Statistiques ---
  stats: AvisStats | null = null;
  loadingStats = true;
  erreurStats: string | null = null;

  // --- Formulaire d'ajout ---
  formulaire = new FormGroup({
    note: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(1), Validators.max(5)] }),
    commentaire: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(COMMENTAIRE_MAX_LENGTH)] }),
  });
  soumissionEnCours = false;
  erreurSoumission: string | null = null;
  soumissionReussie = false;

  constructor(
    private readonly route: ActivatedRoute,
    @Inject(AVIS_SERVICE) private readonly avisService: AvisServiceContract,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.formationId = Number(this.route.parent?.snapshot.paramMap.get('formationId'));
    this.apprenantId = this.authService.getUserId();

    this.chargerAvis(0);
    this.chargerStats();
  }

  get noteInvalide(): boolean {
    const noteControl = this.formulaire.controls.note;
    return noteControl.value < 1 && (noteControl.dirty || this.soumissionTentee);
  }

  private soumissionTentee = false;

  chargerAvis(page: number): void {
    this.loadingAvis = true;
    this.erreurAvis = null;
    this.avisService.getByFormation(this.formationId, page, PAGE_SIZE).subscribe({
      next: (resultat) => {
        this.avis = resultat.content;
        this.pageActuelle = resultat.number;
        this.totalPages = resultat.totalPages;
        this.loadingAvis = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des avis :', err);
        this.erreurAvis = 'Impossible de charger les avis.';
        this.loadingAvis = false;
        this.cdr.markForCheck();
      },
    });
  }

  chargerStats(): void {
    this.loadingStats = true;
    this.erreurStats = null;
    this.avisService.getStats(this.formationId).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loadingStats = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques :', err);
        this.erreurStats = 'Impossible de charger les statistiques.';
        this.loadingStats = false;
        this.cdr.markForCheck();
      },
    });
  }

  // Hauteur de barre relative (en %) pour le petit graphique de répartition des notes
  hauteurBarre(note: number): number {
    if (!this.stats || this.stats.nombreAvis === 0) return 0;
    const max = Math.max(...Object.values(this.stats.repartitionNotes));
    if (max === 0) return 0;
    return (this.stats.repartitionNotes[note] / max) * 100;
  }

  auteurAnonyme(avisItem: Avis): string {
    return `Apprenant #${avisItem.apprenantId}`;
  }

  soumettre(): void {
    this.soumissionTentee = true;
    this.erreurSoumission = null;
    this.soumissionReussie = false;

    if (this.formulaire.invalid || this.formulaire.controls.note.value < 1) {
      this.erreurSoumission = 'Merci de choisir une note (1 à 5 étoiles).';
      return;
    }

    this.soumissionEnCours = true;
    this.avisService.create({
      apprenantId: this.apprenantId,
      formationId: this.formationId,
      note: this.formulaire.controls.note.value,
      commentaire: this.formulaire.controls.commentaire.value || null,
    }).subscribe({
      next: (nouvelAvis) => {
        this.avis = [nouvelAvis, ...this.avis];
        this.soumissionEnCours = false;
        this.soumissionReussie = true;
        this.soumissionTentee = false;
        this.formulaire.reset({ note: 0, commentaire: '' });
        this.chargerStats(); // la moyenne/répartition doit refléter le nouvel avis
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Erreur lors de l'envoi de l'avis :", err);
        // Le backend (et le mock) renvoient un 409 avec un message clair si l'apprenant
        // a déjà un avis sur cette formation — on le relaie tel quel plutôt qu'un message générique.
        this.erreurSoumission = err?.error?.message ?? "Impossible d'envoyer votre avis pour le moment.";
        this.soumissionEnCours = false;
        this.cdr.markForCheck();
      },
    });
  }

  pagePrecedente(): void {
    if (this.pageActuelle > 0) this.chargerAvis(this.pageActuelle - 1);
  }

  pageSuivante(): void {
    if (this.pageActuelle < this.totalPages - 1) this.chargerAvis(this.pageActuelle + 1);
  }
}
