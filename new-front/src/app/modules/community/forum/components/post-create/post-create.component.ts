import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { GroupService } from '../../services/group.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { ForumGroup } from '../../../shared/models/forum-group.model';
import { environment } from '../../../../../../environments/environment';

import { SharedModule } from '../../../shared/shared.module';
import { provideIcons } from '@ng-icons/core';
import { 
  lucideArrowLeft, lucideEdit3, lucideFilm, lucideImage,
  lucideX, lucidePlayCircle, lucideLink, lucideUpload, lucideSend
} from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-post-create',
  providers: [
    provideIcons({
      lucideArrowLeft, lucideEdit3, lucideFilm, lucideImage,
      lucideX, lucidePlayCircle, lucideLink, lucideUpload, lucideSend
    })
  ],
  template: `
    <div class="create-container animate-fade-in-up">
      
      <button type="button" routerLink="/community/forum" class="back-btn flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors">
        <ng-icon name="lucideArrowLeft" size="20"></ng-icon>
      </button>

      <div class="create-card glass-panel">
        <div class="card-header">
          <ng-icon name="lucideEdit3" class="header-icon"></ng-icon>
          <div>
            <h2 class="form-title">Nouveau Post</h2>
            <p class="form-subtitle">Partagez votre idée avec la communauté</p>
          </div>
        </div>

        <div class="card-content">
          <form [formGroup]="form" (ngSubmit)="submit()" class="post-form">

            <div class="flex flex-col gap-1 w-full mb-4">
              <label class="text-sm font-medium text-gray-700">Titre de votre post</label>
              <input formControlName="title" placeholder="Ex: Recherche de conseils en AgriTech" class="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              <span class="text-red-500 text-xs mt-1" *ngIf="form.get('title')?.hasError('required') && form.get('title')?.touched">Titre requis</span>
            </div>

            <div class="flex flex-col gap-1 w-full mb-4">
              <label class="text-sm font-medium text-gray-700">Secteur d'activité</label>
              <select formControlName="sector" class="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="" disabled selected>Choisissez un secteur</option>
                <option *ngFor="let s of sectors" [value]="s">{{ s }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-1 w-full mb-4" *ngIf="canSelectGroup">
              <label class="text-sm font-medium text-gray-700">Associer à un groupe (Optionnel)</label>
              <select formControlName="groupId" class="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Aucun groupe</option>
                <option *ngFor="let g of groups" [value]="g.id">{{ g.name }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-1 w-full mb-4">
              <label class="text-sm font-medium text-gray-700">Contenu détaillé</label>
              <textarea formControlName="content" rows="8" placeholder="Décrivez votre idée, posez votre question..." class="flex min-h-[80px] w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"></textarea>
              <span class="text-red-500 text-xs mt-1" *ngIf="form.get('content')?.hasError('required') && form.get('content')?.touched">Contenu requis</span>
            </div>

            <div class="media-input-section">
              <h4 class="section-title">Médias (Images & Vidéos)</h4>
              <div class="media-urls-list">
                <div *ngFor="let url of mediaUrls; let i = index" class="media-preview-card glass-panel">
                  <div class="preview-header">
                    <span class="preview-type">
                      <ng-icon [name]="isVideo(url) ? 'lucideFilm' : 'lucideImage'"></ng-icon>
                      {{ isVideo(url) ? 'Vidéo' : 'Image' }}
                    </span>
                    <button type="button" class="remove-btn text-red-500 hover:bg-red-50 rounded-full p-1 transition-colors" (click)="removeMediaUrl(i)">
                      <ng-icon name="lucideX"></ng-icon>
                    </button>
                  </div>
                  
                  <div class="flex flex-col gap-1 w-full mt-2">
                    <label class="text-xs font-medium text-gray-700">Lien du média</label>
                    <input [value]="url" (input)="updateMediaUrl(i, $any($event.target).value)" placeholder="Lien image ou vidéo (YouTube/Vimeo)" class="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  </div>

                  <div class="live-preview" *ngIf="url.trim()">
                    <img *ngIf="isImage(url)" [src]="getFullUrl(url)" alt="Preview">
                    <div *ngIf="isVideo(url)" class="video-placeholder">
                      <ng-icon name="lucidePlayCircle"></ng-icon>
                      <span>Vidéo détectée</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="media-actions">
                <button type="button" (click)="addMediaUrl()" class="add-btn hover-lift flex items-center justify-center gap-2">
                  <ng-icon name="lucideLink"></ng-icon> Lien URL
                </button>
                <button type="button" (click)="fileInput.click()" class="add-btn hover-lift flex items-center justify-center gap-2">
                  <ng-icon name="lucideImage"></ng-icon> Importer Image
                </button>
                <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" hidden>
              </div>
            </div>

            <div class="actions">
              <button type="button" class="cancel-btn inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" routerLink="/community/forum">Annuler</button>
              <button class="submit-btn inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 py-2 gap-2 disabled:opacity-50" type="submit" [disabled]="form.invalid || loading">
                <ng-icon *ngIf="!loading" name="lucideSend"></ng-icon>
                <span>{{ loading ? 'Publication en cours...' : 'Publier le post' }}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-container { max-width: 700px; margin: 40px auto; padding: 0 16px; min-height: 80vh; }
    .back-btn { margin-bottom: 24px; background: white; box-shadow: var(--shadow-sm); }
    
    .create-card { background: white; border-radius: 16px; padding: 32px; box-shadow: var(--shadow-md); border: 1px solid rgba(0,0,0,0.05); }
    
    .card-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--co-background); }
    .header-icon { font-size: 40px; width: 40px; height: 40px; color: var(--co-primary); }
    .form-title { margin: 0 0 4px 0; font-size: 24px; font-weight: 800; color: var(--co-secondary); }
    .form-subtitle { margin: 0; color: var(--co-text-muted); font-size: 14px; }
    
    .post-form { display: flex; flex-direction: column; gap: 8px; }
    
    .actions { display: flex; justify-content: flex-end; align-items: center; gap: 16px; margin-top: 16px; padding-top: 24px; border-top: 1px solid var(--co-background); }
    
    .media-input-section { margin-bottom: 24px; padding: 20px; background: #F8FAFC; border-radius: 16px; border: 1px dashed #CBD5E1; }
    .section-title { font-size: 15px; font-weight: 700; color: var(--co-secondary); margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
    
    .media-urls-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }
    .media-preview-card { background: white; border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
    .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .preview-type { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--co-primary); text-transform: uppercase; }
    .preview-type ng-icon { font-size: 18px; width: 18px; height: 18px; }
    
    .live-preview { 
      margin-top: 12px; 
      border-radius: 12px; 
      overflow: hidden; 
      height: 160px; 
      background: #F1F5F9; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      position: relative;
      box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
    }
    .live-preview img { width: 100%; height: 100%; object-fit: cover; }
    .video-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--co-primary); font-weight: 700; font-size: 13px; }
    .video-placeholder ng-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.8; }

    .media-actions { display: flex; gap: 12px; }
    .add-btn { flex: 1; color: var(--co-primary); font-weight: 700; background: white; border: 1px solid var(--co-primary-light); border-radius: 12px; padding: 8px; }
  `]
})
export class PostCreateComponent {

  form: FormGroup;
  loading = false;
  sectors = ['FinTech', 'AgriTech', 'EdTech', 'GreenTech', 'HealthTech', 'E-Commerce'];
  groups: ForumGroup[] = [];
  canSelectGroup = false;
  mediaUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private forumService: ForumService,
    private groupService: GroupService,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      sector: [''],
      tags: [[]],
      groupId: ['']
    });

    this.canSelectGroup = this.authService.isAdmin() || this.authService.isMentor();
    if (this.canSelectGroup) {
      this.groupService.getAllGroups().subscribe(g => this.groups = g);
    }
  }

  addMediaUrl() {
    this.mediaUrls.push('');
  }

  updateMediaUrl(index: number, value: string) {
    this.mediaUrls[index] = value;
  }

  removeMediaUrl(index: number) {
    this.mediaUrls.splice(index, 1);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.loading = true;
      this.forumService.uploadImage(file).subscribe({
        next: (url) => {
          this.mediaUrls.push(url);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          alert('Erreur upload');
        }
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;

    const dto = {
      ...this.form.value,
      authorId: this.authService.getUserId()?.toString() || '',
      mediaUrls: this.mediaUrls.filter((u: string) => u.trim() !== '')
    };

    this.forumService.createPost(dto).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/community/forum']);
      },
      error: () => { this.loading = false; }
    });
  }

  isImage(url: string): boolean {
    if (!url) return false;
    return /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url) || url.includes('images');
  }

  isVideo(url: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  }

  getFullUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.apiGatewayUrl}${url}`;
  }
}