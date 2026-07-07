import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { MemberReputation, ReputationAction } from '../../shared/models/reputation.model';

@Injectable({ providedIn: 'root' })
export class ReputationService {

  private apiUrl = `${environment.apiUrl}/reputation`;

  constructor(private http: HttpClient) {}

  initReputation(memberId: string): Observable<MemberReputation> {
    return this.http.post<MemberReputation>(`${this.apiUrl}/init/${memberId}`, {});
  }

  getReputation(memberId: string): Observable<MemberReputation> {
    return this.http.get<MemberReputation>(`${this.apiUrl}/${memberId}`);
  }

  addPoints(memberId: string, action: ReputationAction): Observable<MemberReputation> {
    return this.http.put<MemberReputation>(
      `${this.apiUrl}/${memberId}/points`, {},
      { params: { action } }
    );
  }

  getLeaderboard(): Observable<MemberReputation[]> {
    return this.http.get<MemberReputation[]>(`${this.apiUrl}/leaderboard`);
  }
}