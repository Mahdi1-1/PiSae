import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LogLectureServiceContract } from './log-lecture.service';
import { LogLecture, LogLectureRequest, RessourceType } from '../models/log-lecture.model';
import { Page } from '../models/page.model';

const LATENCY_MS = 300;
const RESSOURCE_TYPES: RessourceType[] = ['VIDEO', 'PDF', 'QUIZ', 'ARTICLE'];

// Formations "entamées" dans le mock de progression (voir progression-mock.service.ts) —
// on ne génère un historique de lecture réaliste que pour celles-là.
const FORMATIONS_ENTAMEES = [10, 11, 12, 13, 15, 17];

function buildDefaultLogs(apprenantId: number): LogLecture[] {
  const logs: LogLecture[] = [];
  let idCounter = apprenantId * 1000;
  let joursEnArriere = 0;

  for (const formationId of FORMATIONS_ENTAMEES) {
    const nbEntrees = 3 + (formationId % 3); // 3 à 5 entrées, varié par formation
    for (let i = 0; i < nbEntrees; i++) {
      joursEnArriere += 1;
      const date = new Date();
      date.setDate(date.getDate() - joursEnArriere);
      logs.push({
        id: idCounter++,
        apprenantId,
        formationId,
        ressourceId: 100 + i,
        ressourceType: RESSOURCE_TYPES[(formationId + i) % RESSOURCE_TYPES.length],
        tempsPasseSecondes: 180 + (i * 240) + (formationId % 5) * 60,
        dateConsultation: date.toISOString(),
      });
    }
  }
  return logs;
}

export class LogLectureMockService implements LogLectureServiceContract {
  private readonly parApprenant = new Map<number, LogLecture[]>();
  private nextId = 900000;

  private getOrInit(apprenantId: number): LogLecture[] {
    if (!this.parApprenant.has(apprenantId)) {
      this.parApprenant.set(apprenantId, buildDefaultLogs(apprenantId));
    }
    return this.parApprenant.get(apprenantId)!;
  }

  create(request: LogLectureRequest): Observable<LogLecture> {
    const liste = this.getOrInit(request.apprenantId);
    const nouveau: LogLecture = {
      id: this.nextId++,
      apprenantId: request.apprenantId,
      formationId: request.formationId,
      ressourceId: request.ressourceId,
      ressourceType: request.ressourceType,
      tempsPasseSecondes: request.tempsPasseSecondes,
      dateConsultation: new Date().toISOString(),
    };
    liste.push(nouveau);
    return of(nouveau).pipe(delay(LATENCY_MS));
  }

  getById(id: number): Observable<LogLecture> {
    for (const liste of this.parApprenant.values()) {
      const found = liste.find(l => l.id === id);
      if (found) return of(found).pipe(delay(LATENCY_MS));
    }
    return throwError(() => new Error(`LogLecture ${id} introuvable`)).pipe(delay(LATENCY_MS));
  }

  update(id: number, request: LogLectureRequest): Observable<LogLecture> {
    for (const liste of this.parApprenant.values()) {
      const found = liste.find(l => l.id === id);
      if (found) {
        found.ressourceType = request.ressourceType;
        found.tempsPasseSecondes = request.tempsPasseSecondes;
        return of(found).pipe(delay(LATENCY_MS));
      }
    }
    return throwError(() => new Error(`LogLecture ${id} introuvable`)).pipe(delay(LATENCY_MS));
  }

  delete(id: number): Observable<void> {
    for (const liste of this.parApprenant.values()) {
      const index = liste.findIndex(l => l.id === id);
      if (index !== -1) {
        liste.splice(index, 1);
        return of(void 0).pipe(delay(LATENCY_MS));
      }
    }
    return throwError(() => new Error(`LogLecture ${id} introuvable`)).pipe(delay(LATENCY_MS));
  }

  search(formationId: number, dateDebut: string | null, dateFin: string | null, page: number, size: number): Observable<Page<LogLecture>> {
    let toutes = Array.from(this.parApprenant.values()).flat().filter(l => l.formationId === formationId);
    if (dateDebut) toutes = toutes.filter(l => l.dateConsultation >= dateDebut);
    if (dateFin) toutes = toutes.filter(l => l.dateConsultation <= dateFin);
    return of(this.paginate(toutes, page, size)).pipe(delay(LATENCY_MS));
  }

  getByApprenantAndFormation(apprenantId: number, formationId: number, page: number, size: number): Observable<Page<LogLecture>> {
    const liste = this.getOrInit(apprenantId).filter(l => l.formationId === formationId);
    return of(this.paginate(liste, page, size)).pipe(delay(LATENCY_MS));
  }

  getByApprenant(apprenantId: number): Observable<LogLecture[]> {
    return of([...this.getOrInit(apprenantId)]).pipe(delay(LATENCY_MS));
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
