import { HttpClient } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SUIVI_API_BASE } from '../../../core/config/api.config';
import { MatchLevelRequest, MatchLevelResponse } from '../models/recommendation.model';

// Contrat commun à l'implémentation réelle (HttpClient) et mockée — voir
// core/providers/suivi.providers.ts pour la bascule via environment.useMocks.
export interface RecommendationServiceContract {
  matchLevel(request: MatchLevelRequest): Observable<MatchLevelResponse>;
}

export const RECOMMENDATION_SERVICE = new InjectionToken<RecommendationServiceContract>('RECOMMENDATION_SERVICE');

export class RecommendationService implements RecommendationServiceContract {
  private readonly api = `${SUIVI_API_BASE}/recommendation`;

  constructor(private readonly http: HttpClient) {}

  matchLevel(request: MatchLevelRequest): Observable<MatchLevelResponse> {
    return this.http.post<MatchLevelResponse>(`${this.api}/match-level`, request);
  }
}
