import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ForumGroup, CreateGroupDTO } from '../../shared/models/forum-group.model';

@Injectable({ providedIn: 'root' })
export class GroupService {

  private apiUrl = `${environment.apiUrl}/groups`;

  constructor(private http: HttpClient) {}

  createGroup(dto: CreateGroupDTO): Observable<ForumGroup> {
    return this.http.post<ForumGroup>(this.apiUrl, dto);
  }

  getAllGroups(): Observable<ForumGroup[]> {
    return this.http.get<ForumGroup[]>(this.apiUrl);
  }

  getGroupById(id: string): Observable<ForumGroup> {
    return this.http.get<ForumGroup>(`${this.apiUrl}/${id}`);
  }

  getGroupsBySector(sector: string): Observable<ForumGroup[]> {
    return this.http.get<ForumGroup[]>(`${this.apiUrl}/sector/${sector}`);
  }

  joinGroup(groupId: string, userId: string): Observable<ForumGroup> {
    return this.http.put<ForumGroup>(
      `${this.apiUrl}/${groupId}/join`, {}, 
      { params: { userId } }
    );
  }

  leaveGroup(groupId: string, userId: string): Observable<ForumGroup> {
    return this.http.put<ForumGroup>(
      `${this.apiUrl}/${groupId}/leave`, {},
      { params: { userId } }
    );
  }
}