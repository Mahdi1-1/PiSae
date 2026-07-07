import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AvisServiceContract } from './avis.service';
import { Avis, AvisRequest, AvisStats, StatutAvis } from '../models/avis.model';
import { Page } from '../models/page.model';

const LATENCY_MS = 300;

// Avis "de la communauté" pré-existants, attribués à des apprenants fictifs (900+) pour que
// chaque formation ait déjà des avis visibles, peu importe qui est connecté en mode mock.
// Forme volontairement variée : notes 1 à 5, commentaires vides/longs, pour bien tester l'UI.
function buildDefaultAvis(): Avis[] {
  const now = Date.now();
  const jours = (n: number) => new Date(now - n * 86_400_000).toISOString();
  return [
    { id: 1, apprenantId: 901, formationId: 10, note: 5, commentaire: 'Formation excellente, très claire et bien structurée.', dateCreation: jours(2), statut: 'PUBLIE' },
    { id: 2, apprenantId: 902, formationId: 10, note: 4, commentaire: 'Bon contenu, quelques exemples un peu datés.', dateCreation: jours(5), statut: 'PUBLIE' },
    { id: 3, apprenantId: 903, formationId: 10, note: 5, commentaire: null, dateCreation: jours(9), statut: 'PUBLIE' },
    { id: 4, apprenantId: 904, formationId: 11, note: 3, commentaire: "Correct mais manque d'exercices pratiques.", dateCreation: jours(3), statut: 'PUBLIE' },
    { id: 5, apprenantId: 905, formationId: 11, note: 4, commentaire: 'Très utile pour comprendre les signals.', dateCreation: jours(7), statut: 'PUBLIE' },
    { id: 6, apprenantId: 906, formationId: 12, note: 5, commentaire: "Meilleure formation sur l'architecture microservices que j'ai suivie.", dateCreation: jours(1), statut: 'PUBLIE' },
    { id: 7, apprenantId: 907, formationId: 13, note: 2, commentaire: 'Trop théorique à mon goût.', dateCreation: jours(12), statut: 'PUBLIE' },
    { id: 8, apprenantId: 908, formationId: 15, note: 4, commentaire: null, dateCreation: jours(4), statut: 'PUBLIE' },
  ];
}

export class AvisMockService implements AvisServiceContract {
  private readonly avis: Avis[] = buildDefaultAvis();
  private nextId = 800000;

  create(request: AvisRequest): Observable<Avis> {
    const existant = this.avis.find(a =>
      a.apprenantId === request.apprenantId && a.formationId === request.formationId);
    if (existant) {
      // Reproduit la forme de l'erreur backend (ErrorResponse.message) pour que les composants
      // n'aient pas à distinguer mock/réel dans leur gestion d'erreur.
      return throwError(() => ({
        status: 409,
        error: { message: `Un avis existe déjà pour l'apprenant ${request.apprenantId} sur la formation ${request.formationId} — utilisez la mise à jour au lieu d'en créer un nouveau` },
      })).pipe(delay(LATENCY_MS));
    }

    const nouveau: Avis = {
      id: this.nextId++,
      apprenantId: request.apprenantId,
      formationId: request.formationId,
      note: request.note,
      commentaire: request.commentaire ?? null,
      dateCreation: new Date().toISOString(),
      statut: 'PUBLIE',
    };
    this.avis.push(nouveau);
    return of(nouveau).pipe(delay(LATENCY_MS));
  }

  getById(id: number): Observable<Avis> {
    const found = this.avis.find(a => a.id === id);
    return found
      ? of(found).pipe(delay(LATENCY_MS))
      : throwError(() => ({ status: 404, error: { message: `Avis ${id} introuvable` } })).pipe(delay(LATENCY_MS));
  }

  updateContenu(id: number, request: AvisRequest): Observable<Avis> {
    const found = this.avis.find(a => a.id === id);
    if (!found) {
      return throwError(() => ({ status: 404, error: { message: `Avis ${id} introuvable` } })).pipe(delay(LATENCY_MS));
    }
    found.note = request.note;
    found.commentaire = request.commentaire ?? null;
    return of(found).pipe(delay(LATENCY_MS));
  }

  moderer(id: number, statut: StatutAvis): Observable<Avis> {
    const found = this.avis.find(a => a.id === id);
    if (!found) {
      return throwError(() => ({ status: 404, error: { message: `Avis ${id} introuvable` } })).pipe(delay(LATENCY_MS));
    }
    found.statut = statut;
    return of(found).pipe(delay(LATENCY_MS));
  }

  delete(id: number): Observable<void> {
    const index = this.avis.findIndex(a => a.id === id);
    if (index === -1) {
      return throwError(() => ({ status: 404, error: { message: `Avis ${id} introuvable` } })).pipe(delay(LATENCY_MS));
    }
    this.avis.splice(index, 1);
    return of(void 0).pipe(delay(LATENCY_MS));
  }

  getByFormation(formationId: number, page: number, size: number): Observable<Page<Avis>> {
    const filtres = this.avis
      .filter(a => a.formationId === formationId)
      .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
    return of(this.paginate(filtres, page, size)).pipe(delay(LATENCY_MS));
  }

  getStats(formationId: number): Observable<AvisStats> {
    const publies = this.avis.filter(a => a.formationId === formationId && a.statut === 'PUBLIE');
    const moyenne = publies.length
      ? publies.reduce((sum, a) => sum + a.note, 0) / publies.length
      : 0;
    const repartition: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const a of publies) {
      repartition[a.note] = (repartition[a.note] ?? 0) + 1;
    }
    return of({
      formationId,
      noteMoyenne: Math.round(moyenne * 10) / 10,
      nombreAvis: publies.length,
      repartitionNotes: repartition,
    }).pipe(delay(LATENCY_MS));
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
