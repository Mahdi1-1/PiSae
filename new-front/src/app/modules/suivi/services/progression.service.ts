import { HttpClient, HttpParams } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SUIVI_API_BASE } from '../../../core/config/api.config';
import { ApprenantResume, Inactivite, Progression, ProgressionRequest } from '../models/progression.model';
import { Page } from '../models/page.model';

// Contrat commun à l'implémentation réelle (HttpClient) et mockée — voir
// core/providers/suivi.providers.ts pour la bascule via environment.useMocks.
export interface ProgressionServiceContract {
  createOrUpdate(request: ProgressionRequest): Observable<Progression>;
  getById(id: number): Observable<Progression>;
  update(id: number, request: ProgressionRequest): Observable<Progression>;
  delete(id: number): Observable<void>;
  getByFormation(formationId: number, page: number, size: number): Observable<Page<Progression>>;
  getByApprenant(apprenantId: number): Observable<Progression[]>;
  getResume(apprenantId: number): Observable<ApprenantResume>;
  getInactifs(jours: number): Observable<Inactivite[]>;
}

export const PROGRESSION_SERVICE = new InjectionToken<ProgressionServiceContract>('PROGRESSION_SERVICE');

export class ProgressionService implements ProgressionServiceContract {
  private readonly api = `${SUIVI_API_BASE}/progression`;

  constructor(private readonly http: HttpClient) {}

  createOrUpdate(request: ProgressionRequest): Observable<Progression> {
    return this.http.post<Progression>(this.api, request);
  }

  getById(id: number): Observable<Progression> {
    return this.http.get<Progression>(`${this.api}/${id}`);
  }

  update(id: number, request: ProgressionRequest): Observable<Progression> {
    return this.http.put<Progression>(`${this.api}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getByFormation(formationId: number, page: number, size: number): Observable<Page<Progression>> {
    const params = new HttpParams()
      .set('formationId', formationId)
      .set('page', page)
      .set('size', size);
    return this.http.get<Page<Progression>>(this.api, { params });
  }

  getByApprenant(apprenantId: number): Observable<Progression[]> {
    return this.http.get<Progression[]>(`${this.api}/apprenant/${apprenantId}`);
  }

  getResume(apprenantId: number): Observable<ApprenantResume> {
    return this.http.get<ApprenantResume>(`${this.api}/apprenant/${apprenantId}/resume`);
  }

  getInactifs(jours: number): Observable<Inactivite[]> {
    const params = new HttpParams().set('jours', jours);
    return this.http.get<Inactivite[]>(`${this.api}/inactifs`, { params });
  }
}
