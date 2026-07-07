import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface UserPublic {
  id: number;
  name?: string;
  prenom?: string;
  email?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {

  private readonly baseUrl = 'http://localhost:8091/api/users';
  private readonly cache = new Map<string, UserPublic>();

  constructor(private http: HttpClient) { }

  loadDirectory(): Observable<UserPublic[]> {
    return this.http.get<UserPublic[]>(`${this.baseUrl}/directory`).pipe(
      tap(users => users.forEach(u => this.cache.set(String(u.id), u)))
    );
  }

  getUser(userId: string): Observable<UserPublic> {
    const key = String(userId);
    const cached = this.cache.get(key);
    if (cached) {
      return of(cached);
    }
    return this.http.get<UserPublic>(`${this.baseUrl}/${userId}`).pipe(
      tap(u => this.cache.set(key, u)),
      catchError(() =>
        of({ id: Number(userId), name: '', prenom: 'Utilisateur', email: '' })
      )
    );
  }

  getDisplayName(userId: string): Observable<string> {
    return this.getUser(userId).pipe(
      map(u => {
        const full = `${u.name || ''} ${u.prenom || ''}`.trim();
        return full || `Utilisateur ${userId}`;
      })
    );
  }

  displayNameFromUser(u: UserPublic): string {
    const full = `${u.name || ''} ${u.prenom || ''}`.trim();
    return full || `Utilisateur ${u.id}`;
  }
}
