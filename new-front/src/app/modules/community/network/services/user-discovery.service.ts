import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { UserDiscoveryResponse } from '../../shared/models/user-discovery.model';

@Injectable({ providedIn: 'root' })
export class UserDiscoveryService {

  private apiUrl = `${environment.apiUrl}/connections`;

  constructor(private http: HttpClient) {}

  discoverUsers(query: string, currentUserId: string): Observable<UserDiscoveryResponse[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('currentUserId', currentUserId);
    
    return this.http.get<UserDiscoveryResponse[]>(`${this.apiUrl}/discover`, { params });
  }

  getRecommendedUsers(userId: string): Observable<UserDiscoveryResponse[]> {
    return this.http.get<UserDiscoveryResponse[]>(`${this.apiUrl}/recommended/${userId}`);
  }
}
