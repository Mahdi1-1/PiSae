import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Opportunity, CreateOpportunityDTO,
  OpportunityApplication, ApplyDTO
} from '../../shared/models/opportunity.model';
import { Page } from '../../shared/models/page.model';

@Injectable({ providedIn: 'root' })
export class MarketplaceService {

  private apiUrl = `${environment.apiUrl}/marketplace`;

  constructor(private http: HttpClient) {}

  // ── Opportunities ──────────────────────────────

  createOpportunity(dto: CreateOpportunityDTO): Observable<Opportunity> {
    return this.http.post<Opportunity>(this.apiUrl, dto);
  }

  getOpportunity(id: string): Observable<Opportunity> {
    return this.http.get<Opportunity>(`${this.apiUrl}/${id}`);
  }

  updateOpportunity(id: string, dto: CreateOpportunityDTO): Observable<Opportunity> {
    return this.http.put<Opportunity>(`${this.apiUrl}/${id}`, dto);
  }

  getAllOpportunities(page = 0, size = 10): Observable<Page<Opportunity>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Opportunity>>(this.apiUrl, { params });
  }

  getBySector(sector: string): Observable<Opportunity[]> {
    return this.http.get<Opportunity[]>(`${this.apiUrl}/sector/${sector}`);
  }

  getByType(type: string, page = 0, size = 6): Observable<Page<Opportunity>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Opportunity>>(`${this.apiUrl}/type/${type}`, { params });
  }

  getMyOpportunities(publisherId: string): Observable<Opportunity[]> {
    return this.http.get<Opportunity[]>(`${this.apiUrl}/my/${publisherId}`);
  }

  updateStatus(id: string, status: string): Observable<Opportunity> {
    return this.http.put<Opportunity>(
      `${this.apiUrl}/${id}/status`, {},
      { params: { status } }
    );
  }

  deleteOpportunity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ── Applications ───────────────────────────────

  apply(opportunityId: string, dto: ApplyDTO): Observable<OpportunityApplication> {
    return this.http.post<OpportunityApplication>(
      `${this.apiUrl}/${opportunityId}/apply`, dto
    );
  }

  applyWithFile(opportunityId: string, dto: ApplyDTO, file: File): Observable<OpportunityApplication> {
    const formData = new FormData();
    formData.append('candidateId', dto.candidateId);
    formData.append('coverLetter', dto.coverLetter || '');
    formData.append('cvUrl', dto.cvUrl || '');
    formData.append('cvFile', file);
    
    return this.http.post<OpportunityApplication>(
      `${this.apiUrl}/${opportunityId}/apply-with-file`, formData
    );
  }

  getMyApplications(candidateId: string): Observable<OpportunityApplication[]> {
    return this.http.get<OpportunityApplication[]>(
      `${this.apiUrl}/applications/candidate/${candidateId}`
    );
  }

  getApplicationsForOpportunity(opportunityId: string): Observable<OpportunityApplication[]> {
    return this.http.get<OpportunityApplication[]>(
      `${this.apiUrl}/${opportunityId}/applications`
    );
  }

  updateApplicationStatus(applicationId: string, status: string): Observable<OpportunityApplication> {
    return this.http.put<OpportunityApplication>(
      `${this.apiUrl}/applications/${applicationId}/status`, {},
      { params: { status } }
    );
  }

  withdrawApplication(applicationId: string): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/applications/${applicationId}/withdraw`, {}
    );
  }

  getTopCandidates(opportunityId: string): Observable<OpportunityApplication[]> {
    return this.http.get<OpportunityApplication[]>(
      `${this.apiUrl}/${opportunityId}/recommendations`
    );
  }
  // ── AI-Powered Recommendations ─────────────────

  /**
   * Get personalized opportunity recommendations for a user based on their CV
   * Uses advanced matching algorithm combining skills, experience, and education
   */
  getRecommendedOpportunitiesForUser(userId: string, cvUrl: string): Observable<Opportunity[]> {
    const params = new HttpParams().set('cvUrl', cvUrl);
    return this.http.get<Opportunity[]>(
      `${this.apiUrl}/users/${userId}/recommendations`, { params }
    );
  }
  // ── File Downloads ─────────────────────────────

  downloadCv(fileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/cv/${fileName}`, {
      responseType: 'blob'
    });
  }

  // ── Quizzes ─────────────────────────────────────

  getQuiz(quizId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/quiz/${quizId}`);
  }

  submitQuiz(quizId: string, answers: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/quiz/${quizId}/submit`, answers);
  }

  sendQuizToTopCandidates(opportunityId: string, count?: number): Observable<OpportunityApplication[]> {
    let params = new HttpParams();
    if (count !== undefined && count > 0) {
      params = params.set('count', count);
    }
    return this.http.post<OpportunityApplication[]>(
      `${this.apiUrl}/${opportunityId}/send-quiz-to-top`, {},
      { params }
    );
  }

  finaliseApplication(applicationId: string): Observable<OpportunityApplication> {
    return this.http.post<OpportunityApplication>(
      `${this.apiUrl}/applications/${applicationId}/finalise`, {}
    );
  }
}