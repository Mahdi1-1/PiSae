import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

export interface TranscriptSegment {
  speaker: string;
  language: string;
  text: string;
  start: number;
  end: number;
  meetingId: string;
}

export interface TranscriptionResult {
  success: boolean;
  meetingId: string;
  totalSegments: number;
  speakers: string[];
  segments: TranscriptSegment[];
  processedAt: string;
  processingTimeSec?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranscriptionService {
  
  // ✅ CHANGEMENT ICI : Port 8090 (direct) au lieu de 8080 (Gateway)
  // Comme votre PartenaireService qui fonctionne !
  private springBootUrl = 'http://localhost:8082';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Headers identiques à PartenaireService (qui marche déjà !)
   */
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-User-Role': `ROLE_${this.authService.getRole()}`,
      'X-User-Id': String(this.authService.getUserId())
      // ❌ PAS de Authorization: Bearer ici (votre backend utilise X-User-* pas JWT Bearer)
    });
  }

  async transcribeMeeting(audioBlob: Blob, meetingId: string): Promise<TranscriptionResult> {
    const formData = new FormData();
    
    const audioFile = new File([audioBlob], `meeting_${meetingId}_${Date.now()}.webm`, {
      type: 'audio/webm'
    });
    
    formData.append('audio', audioFile);
    formData.append('meetingId', meetingId);
    formData.append('numSpeakers', '2');

    try {
      console.log(`📤 Envoi direct vers Spring Boot: ${this.springBootUrl}/api/transcripts/process`);
      console.log(`📁 Taille: ${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`🔑 Headers: X-User-Role=ROLE_${this.authService.getRole()}, X-User-Id=${this.authService.getUserId()}`);

      const response = await firstValueFrom(
        this.http.post<TranscriptionResult>(
          `${this.springBootUrl}/api/transcripts/process`,  // ← 8090 direct !
          formData,
          { headers: this.getAuthHeaders() }
        )
      );

      console.log('✅ Réponse reçue:', response);
      return response;

    } catch (error: any) {
      console.error('❌ Erreur transcription:', error);
      
      return {
        success: false,
        meetingId,
        totalSegments: 0,
        speakers: [],
        segments: [],
        processedAt: new Date().toISOString(),
        error: this.extractErrorMessage(error)
      };
    }
  }

  async getTranscript(meetingId: string): Promise<TranscriptionResult | null> {
    try {
      return await firstValueFrom(
        this.http.get<TranscriptionResult>(
          `${this.springBootUrl}/api/transcripts/${meetingId}`,
          { headers: this.getAuthHeaders() }
        )
      );
    } catch (error) {
      console.error('❌ Erreur récupération:', error);
      return null;
    }
  }

  async downloadTranscript(meetingId: string): Promise<Blob | null> {
    try {
      const blob: Blob = await firstValueFrom(
        this.http.get(
          `${this.springBootUrl}/api/transcripts/${meetingId}/download`,
          { 
            responseType: 'blob' as const,
            headers: this.getAuthHeaders()
          }
        )
      );
      
      return blob;
      
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      return null;
    }
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.message) return error.error.message;
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    return 'Erreur de communication';
  }
}