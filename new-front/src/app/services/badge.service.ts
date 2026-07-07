import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Badge } from '../models/badge';
import { EVENT_API_BASE } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class BadgeService {
  private readonly api = `${EVENT_API_BASE}/badges`;

  constructor(private readonly http: HttpClient) {}

  getMyBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${this.api}/me`);
  }

  /** Fetch the badge PNG as a Blob (used to render or download through the auth-bearing HttpClient). */
  getBadgeImage(badgeId: number, download = false): Observable<Blob> {
    const params = download ? new HttpParams().set('download', 'true') : undefined;
    return this.http.get(`${this.api}/${badgeId}/image`, {
      responseType: 'blob',
      params,
    });
  }
}
