import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certificate, VerificationResponse } from '../models/certificate';
import { EVENT_API_BASE } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class CertificateService {
  private readonly api = `${EVENT_API_BASE}/certificates`;

  constructor(private readonly http: HttpClient) {}

  getMyCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.api}/me`);
  }

  downloadCertificate(id: number): Observable<Blob> {
    return this.http.get(`${this.api}/${id}/download`, { responseType: 'blob' });
  }

  verify(token: string): Observable<VerificationResponse> {
    return this.http.get<VerificationResponse>(`${EVENT_API_BASE}/verify/${token}`);
  }
}
