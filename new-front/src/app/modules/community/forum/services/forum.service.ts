import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ForumPost, CreatePostDTO, Comment } from '../../shared/models/forum-post.model';
import { Page } from '../../shared/models/page.model';

@Injectable({ providedIn: 'root' })
export class ForumService {

  private apiUrl = `${environment.apiUrl}/forums`;

  constructor(private http: HttpClient) {}

  // ── Posts ──────────────────────────────────────

  createPost(dto: CreatePostDTO): Observable<ForumPost> {
    return this.http.post<ForumPost>(this.apiUrl, dto);
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.apiUrl + '/upload', formData, { responseType: 'text' });
  }

  getAllPosts(): Observable<ForumPost[]> {
    return this.http.get<ForumPost[]>(this.apiUrl);
  }

  getPagedPosts(page = 0, size = 10): Observable<Page<ForumPost>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<Page<ForumPost>>(`${this.apiUrl}/paged`, { params });
  }

  getPostsByGroup(groupId: string): Observable<ForumPost[]> {
    return this.http.get<ForumPost[]>(`${this.apiUrl}/group/${groupId}`);
  }

  getPostsBySector(sector: string): Observable<ForumPost[]> {
    return this.http.get<ForumPost[]>(`${this.apiUrl}/sector/${sector}`);
  }

  searchPosts(keyword: string): Observable<ForumPost[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<ForumPost[]>(`${this.apiUrl}/search`, { params });
  }
updatePost(postId: string, dto: Partial<CreatePostDTO>): Observable<ForumPost> {
  return this.http.put<ForumPost>(`${this.apiUrl}/${postId}`, dto);
}

updatePostStatus(postId: string, status: string): Observable<ForumPost> {
  return this.http.put<ForumPost>(`${this.apiUrl}/${postId}/status`, {}, { params: { status } });
}

deletePost(postId: string): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${postId}`);
}
  likePost(postId: string, userId: string): Observable<ForumPost> {
    const params = new HttpParams().set('userId', userId);
    return this.http.put<ForumPost>(`${this.apiUrl}/${postId}/like`, {}, { params });
  }

  addComment(postId: string, comment: Comment): Observable<ForumPost> {
    return this.http.post<ForumPost>(`${this.apiUrl}/${postId}/comments`, comment);
  }

  addReplyToComment(postId: string, commentIndex: number, reply: Comment): Observable<ForumPost> {
    return this.http.post<ForumPost>(`${this.apiUrl}/${postId}/comments/${commentIndex}/reply`, reply);
  }
}