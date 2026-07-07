import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { MemberConnection } from '../../shared/models/connection.model';

@Injectable({ providedIn: 'root' })
export class ConnectionService {

  private apiUrl = `${environment.apiUrl}/connections`;

  constructor(private http: HttpClient) {}

  sendRequest(requesterId: string, targetId: string, message?: string): Observable<MemberConnection> {
    let params = new HttpParams()
      .set('requesterId', requesterId)
      .set('targetId', targetId);
    if (message) params = params.set('message', message);
    return this.http.post<MemberConnection>(`${this.apiUrl}/request`, {}, { params });
  }

  acceptRequest(connectionId: string): Observable<MemberConnection> {
    return this.http.put<MemberConnection>(`${this.apiUrl}/${connectionId}/accept`, {});
  }

  declineRequest(connectionId: string): Observable<MemberConnection> {
    return this.http.put<MemberConnection>(`${this.apiUrl}/${connectionId}/decline`, {});
  }

  blockMember(connectionId: string): Observable<MemberConnection> {
    return this.http.put<MemberConnection>(`${this.apiUrl}/${connectionId}/block`, {});
  }

  getMyConnections(memberId: string): Observable<MemberConnection[]> {
    return this.http.get<MemberConnection[]>(`${this.apiUrl}/${memberId}`);
  }

  getPendingRequests(memberId: string): Observable<MemberConnection[]> {
    return this.http.get<MemberConnection[]>(`${this.apiUrl}/${memberId}/pending`);
  }

  getSentPendingRequests(memberId: string): Observable<MemberConnection[]> {
    return this.http.get<MemberConnection[]>(`${this.apiUrl}/${memberId}/pending/sent`);
  }

  getAllConnections(memberId: string): Observable<MemberConnection[]> {
    return this.http.get<MemberConnection[]>(`${this.apiUrl}/${memberId}/all`);
  }

  areConnected(memberId1: string, memberId2: string): Observable<boolean> {
    const params = new HttpParams()
      .set('memberId1', memberId1)
      .set('memberId2', memberId2);
    return this.http.get<boolean>(`${this.apiUrl}/check`, { params });
  }
}