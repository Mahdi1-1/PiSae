import { Injectable, OnDestroy } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AudioRecorderService implements OnDestroy {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  public isRecording = false;
  public recordingStarted$ = new Subject<void>();
  public recordingStopped$ = new Subject<Blob>();
  public error$ = new Subject<string>();

  async startRecording(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      const options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn('webm non supporté, fallback à audio/wav');
        (options as any).mimeType = 'audio/wav';
      }

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.recordingStopped$.next(audioBlob);
        this.stopAllTracks();
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      this.recordingStarted$.next();
      console.log('🎙️ Enregistrement audio démarré');
      return true;

    } catch (error: any) {
      console.error('❌ Erreur démarrage enregistrement:', error);
      this.error$.next(error.message || 'Accès micro refusé');
      return false;
    }
  }

  /**
   * Stop recording and return a Promise that resolves
   * with the final Blob — so callers can await the audio data.
   */
  stopRecordingAndWait(timeoutMs = 8000): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!this.mediaRecorder) {
      reject(new Error('No recorder'));
      return;
    }

    // Timeout safety — prevents infinite hang if onstop never fires
    const timer = setTimeout(() => {
      sub.unsubscribe();
      reject(new Error('stopRecordingAndWait timed out'));
    }, timeoutMs);

    const sub = this.recordingStopped$.subscribe({
      next: blob => {
        clearTimeout(timer);
        sub.unsubscribe();
        resolve(blob);
      },
      error: err => {
        clearTimeout(timer);
        sub.unsubscribe();
        reject(err);
      }
    });

    if (this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
    // else: onstop already in flight, subscription will catch it
  });
}

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      console.log('⏹️ Arrêt enregistrement...');
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  private stopAllTracks(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, { type: blob.type });
  }

  ngOnDestroy(): void {
    this.stopAllTracks();
    if (this.isRecording && this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
  }
}