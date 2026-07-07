import { HttpClient, HttpParams } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SUIVI_API_BASE } from '../../../core/config/api.config';
import { Avis, AvisRequest, AvisStats, StatutAvis } from '../models/avis.model';
import { Page } from '../models/page.model';

export interface AvisServiceContract {
  create(request: AvisRequest): Observable<Avis>;
  getById(id: number): Observable<Avis>;
  updateContenu(id: number, request: AvisRequest): Observable<Avis>;
  moderer(id: number, statut: StatutAvis): Observable<Avis>;
  delete(id: number): Observable<void>;
  getByFormation(formationId: number, page: number, size: number): Observable<Page<Avis>>;
  getStats(formationId: number): Observable<AvisStats>;
}

export const AVIS_SERVICE = new InjectionToken<AvisServiceContract>('AVIS_SERVICE');

export class AvisService implements AvisServiceContract {
  private readonly api = `${SUIVI_API_BASE}/avis`;

  constructor(private readonly http: HttpClient) {}

  create(request: AvisRequest): Observable<Avis> {
    return this.http.post<Avis>(this.api, request);
  }

  getById(id: number): Observable<Avis> {
    return this.http.get<Avis>(`${this.api}/${id}`);
  }

  updateContenu(id: number, request: AvisRequest): Observable<Avis> {
    return this.http.put<Avis>(`${this.api}/${id}`, request);
  }

  moderer(id: number, statut: StatutAvis): Observable<Avis> {
    return this.http.patch<Avis>(`${this.api}/${id}/statut`, { statut });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getByFormation(formationId: number, page: number, size: number): Observable<Page<Avis>> {
    const params = new HttpParams().set('formationId', formationId).set('page', page).set('size', size);
    return this.http.get<Page<Avis>>(this.api, { params });
  }

  getStats(formationId: number): Observable<AvisStats> {
    return this.http.get<AvisStats>(`${this.api}/formation/${formationId}/stats`);
  }
}
