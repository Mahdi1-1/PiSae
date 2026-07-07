import { HttpClient, HttpParams } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SUIVI_API_BASE } from '../../../core/config/api.config';
import { LogLecture, LogLectureRequest } from '../models/log-lecture.model';
import { Page } from '../models/page.model';

export interface LogLectureServiceContract {
  create(request: LogLectureRequest): Observable<LogLecture>;
  getById(id: number): Observable<LogLecture>;
  update(id: number, request: LogLectureRequest): Observable<LogLecture>;
  delete(id: number): Observable<void>;
  search(formationId: number, dateDebut: string | null, dateFin: string | null, page: number, size: number): Observable<Page<LogLecture>>;
  getByApprenantAndFormation(apprenantId: number, formationId: number, page: number, size: number): Observable<Page<LogLecture>>;
  getByApprenant(apprenantId: number): Observable<LogLecture[]>;
}

export const LOG_LECTURE_SERVICE = new InjectionToken<LogLectureServiceContract>('LOG_LECTURE_SERVICE');

export class LogLectureService implements LogLectureServiceContract {
  private readonly api = `${SUIVI_API_BASE}/logs`;

  constructor(private readonly http: HttpClient) {}

  create(request: LogLectureRequest): Observable<LogLecture> {
    return this.http.post<LogLecture>(this.api, request);
  }

  getById(id: number): Observable<LogLecture> {
    return this.http.get<LogLecture>(`${this.api}/${id}`);
  }

  update(id: number, request: LogLectureRequest): Observable<LogLecture> {
    return this.http.put<LogLecture>(`${this.api}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  search(formationId: number, dateDebut: string | null, dateFin: string | null, page: number, size: number): Observable<Page<LogLecture>> {
    let params = new HttpParams().set('formationId', formationId).set('page', page).set('size', size);
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    return this.http.get<Page<LogLecture>>(this.api, { params });
  }

  getByApprenantAndFormation(apprenantId: number, formationId: number, page: number, size: number): Observable<Page<LogLecture>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<LogLecture>>(`${this.api}/apprenant/${apprenantId}/formation/${formationId}`, { params });
  }

  getByApprenant(apprenantId: number): Observable<LogLecture[]> {
    return this.http.get<LogLecture[]>(`${this.api}/apprenant/${apprenantId}`);
  }
}
