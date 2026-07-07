import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ProgressionServiceContract } from './progression.service';
import { ApprenantResume, Inactivite, Progression, ProgressionRequest, StatutProgression } from '../models/progression.model';
import { Page } from '../models/page.model';

const LATENCY_MS = 300;

// 8 formations (mêmes id que FormationCatalogService) avec des pourcentages variés pour bien
// couvrir les 3 états visuellement : 0% (NON_COMMENCE), plusieurs paliers d'EN_COURS, et TERMINE.
const DEFAULT_POURCENTAGES: Record<number, number> = {
  10: 100, // TERMINE
  11: 65,  // EN_COURS
  12: 100, // TERMINE
  13: 20,  // EN_COURS
  14: 0,   // NON_COMMENCE
  15: 45,  // EN_COURS
  16: 0,   // NON_COMMENCE
  17: 88,  // EN_COURS (proche de la fin)
};

function computeStatut(pourcentage: number): StatutProgression {
  if (pourcentage <= 0) return 'NON_COMMENCE';
  if (pourcentage >= 100) return 'TERMINE';
  return 'EN_COURS';
}

const NB_CHAPITRES = 5;

function buildDefaultProgressions(apprenantId: number): Progression[] {
  const now = new Date().toISOString();
  const rows: Progression[] = [];
  let id = apprenantId * 1000;

  for (const [formationIdStr, pourcentageFormation] of Object.entries(DEFAULT_POURCENTAGES)) {
    const formationId = Number(formationIdStr);

    // Ligne "niveau formation" (chapitreId = null) — c'est celle qu'affiche "Mes formations".
    rows.push({
      id: ++id,
      apprenantId,
      formationId,
      chapitreId: null,
      pourcentage: pourcentageFormation,
      dateDebut: now,
      dateDerniereMaj: now,
      statut: computeStatut(pourcentageFormation),
    });

    // Lignes "niveau chapitre" : remplissage séquentiel cohérent avec le % de la formation
    // (chapitre 1 se termine avant que le 2 commence, etc.) — affichées dans l'onglet
    // "Ma progression" du détail formation.
    const pointsParChapitre = 100 / NB_CHAPITRES;
    for (let i = 0; i < NB_CHAPITRES; i++) {
      const debutChapitre = i * pointsParChapitre;
      const pourcentageChapitre = Math.min(100, Math.max(0,
        ((pourcentageFormation - debutChapitre) / pointsParChapitre) * 100));
      rows.push({
        id: ++id,
        apprenantId,
        formationId,
        chapitreId: formationId * 100 + i + 1, // même formule que ChapitreCatalogService
        pourcentage: Math.round(pourcentageChapitre),
        dateDebut: now,
        dateDerniereMaj: now,
        statut: computeStatut(Math.round(pourcentageChapitre)),
      });
    }
  }

  return rows;
}

export class ProgressionMockService implements ProgressionServiceContract {
  // Une liste de progressions par apprenant, générée à la demande (paresseusement) —
  // fonctionne quel que soit l'utilisateur connecté en mode mock, pas seulement un id fixe.
  private readonly parApprenant = new Map<number, Progression[]>();
  private nextId = 100000;

  private getOrInit(apprenantId: number): Progression[] {
    if (!this.parApprenant.has(apprenantId)) {
      this.parApprenant.set(apprenantId, buildDefaultProgressions(apprenantId));
    }
    return this.parApprenant.get(apprenantId)!;
  }

  createOrUpdate(request: ProgressionRequest): Observable<Progression> {
    const liste = this.getOrInit(request.apprenantId);
    const chapitreId = request.chapitreId ?? null;
    const existante = liste.find(p =>
      p.formationId === request.formationId && p.chapitreId === chapitreId);

    const now = new Date().toISOString();
    if (existante) {
      existante.pourcentage = request.pourcentage;
      existante.statut = computeStatut(request.pourcentage);
      existante.dateDerniereMaj = now;
      return of(existante).pipe(delay(LATENCY_MS));
    }

    const nouvelle: Progression = {
      id: this.nextId++,
      apprenantId: request.apprenantId,
      formationId: request.formationId,
      chapitreId,
      pourcentage: request.pourcentage,
      dateDebut: now,
      dateDerniereMaj: now,
      statut: computeStatut(request.pourcentage),
    };
    liste.push(nouvelle);
    return of(nouvelle).pipe(delay(LATENCY_MS));
  }

  getById(id: number): Observable<Progression> {
    for (const liste of this.parApprenant.values()) {
      const found = liste.find(p => p.id === id);
      if (found) return of(found).pipe(delay(LATENCY_MS));
    }
    return throwError(() => new Error(`Progression ${id} introuvable`)).pipe(delay(LATENCY_MS));
  }

  update(id: number, request: ProgressionRequest): Observable<Progression> {
    for (const liste of this.parApprenant.values()) {
      const found = liste.find(p => p.id === id);
      if (found) {
        found.chapitreId = request.chapitreId ?? null;
        found.pourcentage = request.pourcentage;
        found.statut = computeStatut(request.pourcentage);
        found.dateDerniereMaj = new Date().toISOString();
        return of(found).pipe(delay(LATENCY_MS));
      }
    }
    return throwError(() => new Error(`Progression ${id} introuvable`)).pipe(delay(LATENCY_MS));
  }

  delete(id: number): Observable<void> {
    for (const liste of this.parApprenant.values()) {
      const index = liste.findIndex(p => p.id === id);
      if (index !== -1) {
        liste.splice(index, 1);
        return of(void 0).pipe(delay(LATENCY_MS));
      }
    }
    return throwError(() => new Error(`Progression ${id} introuvable`)).pipe(delay(LATENCY_MS));
  }

  getByFormation(formationId: number, page: number, size: number): Observable<Page<Progression>> {
    const toutes = Array.from(this.parApprenant.values()).flat()
      .filter(p => p.formationId === formationId);
    return of(this.paginate(toutes, page, size)).pipe(delay(LATENCY_MS));
  }

  getByApprenant(apprenantId: number): Observable<Progression[]> {
    return of([...this.getOrInit(apprenantId)]).pipe(delay(LATENCY_MS));
  }

  getResume(apprenantId: number): Observable<ApprenantResume> {
    const liste = this.getOrInit(apprenantId);
    const moyenne = liste.length
      ? liste.reduce((sum, p) => sum + p.pourcentage, 0) / liste.length
      : 0;
    // Niveau formation uniquement (chapitreId null) : une formation avec des chapitres
    // partiellement terminés mais encore EN_COURS globalement ne doit pas compter ici.
    const formationsTerminees = new Set(
      liste.filter(p => p.chapitreId === null && p.statut === 'TERMINE').map(p => p.formationId)
    ).size;
    // Temps total mocké de façon cohérente avec LogLectureMockService (voir ce fichier) :
    // ~45 minutes par formation entamée, pour un résumé plausible sans dépendre d'un autre service.
    const tempsTotalPasseSecondes = liste.filter(p => p.pourcentage > 0).length * 45 * 60;

    return of({
      apprenantId,
      moyennePourcentage: Math.round(moyenne * 10) / 10,
      nombreFormationsTerminees: formationsTerminees,
      tempsTotalPasseSecondes,
    }).pipe(delay(LATENCY_MS));
  }

  getInactifs(jours: number): Observable<Inactivite[]> {
    // Pas de scénario d'inactivité pertinent à mocker de façon générique (dépend de "qui
    // est connecté") — retourne une liste vide, le vrai comportement s'observe en mode réel.
    return of([]).pipe(delay(LATENCY_MS));
  }

  private paginate<T>(items: T[], page: number, size: number): Page<T> {
    const start = page * size;
    const content = items.slice(start, start + size);
    const totalPages = Math.max(1, Math.ceil(items.length / size));
    return {
      content,
      totalElements: items.length,
      totalPages,
      number: page,
      size,
      first: page === 0,
      last: page >= totalPages - 1,
      empty: content.length === 0,
      numberOfElements: content.length,
    };
  }
}
