import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ForumPost } from '../../../shared/models/forum-post.model';
import { environment } from '../../../../../../environments/environment';
import { provideIcons } from '@ng-icons/core';
import { lucideUser, lucideMessageSquare, lucideEye, lucideThumbsUp, lucideArrowRight, lucideUsers, lucideImage, lucidePlay } from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-post-card',
  providers: [
    provideIcons({ lucideUser, lucideMessageSquare, lucideEye, lucideThumbsUp, lucideArrowRight, lucideUsers, lucideImage, lucidePlay })
  ],
  template: `
    <div class="premium-card animate-fade-in-up" (click)="clicked.emit(post.id)">
      <div class="card-header">
        <div class="author-avatar glass-panel">
          <ng-icon name="lucideUser"></ng-icon>
        </div>
        <div class="header-texts">
          <div class="top-meta">
            <span class="badge-premium badge-premium-blue">{{ post.sector }}</span>
            <span class="badge-premium badge-premium-purple" *ngIf="post.groupName">
              <ng-icon name="lucideUsers" class="mr-1"></ng-icon> {{ post.groupName }}
            </span>
            <div class="spacer"></div>
            <span class="status-dot" [class.open]="post.status === 'OPEN'"></span>
            <span class="status-text">{{ post.status === 'OPEN' ? 'Actif' : 'Clôturé' }}</span>
          </div>
          <h3 class="post-title">{{ post.title }}</h3>
          <div class="author-meta">
            <span class="author-name">Par {{ post.authorName || 'Membre Community' }}</span>
            <span class="dot-separator">·</span>
            <span class="post-date">{{ post.createdAt | date:'dd MMM yyyy' }}</span>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="body-content">
          <p class="post-excerpt">{{ post.content | slice:0:160 }}{{ post.content.length > 160 ? '...' : '' }}</p>
          <div class="tag-row" *ngIf="post.tags?.length">
            <span *ngFor="let tag of post.tags | slice:0:3" class="post-tag">#{{ tag }}</span>
          </div>
        </div>
        <div class="post-thumbnail" *ngIf="hasMedia()">
          <ng-container *ngIf="getFirstImageUrl(); else videoIcon">
            <img [src]="getFullUrl(getFirstImageUrl()!)" alt="Preview">
          </ng-container>
          <ng-template #videoIcon>
            <div class="video-placeholder-mini">
              <ng-icon name="lucidePlay"></ng-icon>
            </div>
          </ng-template>
          
          <div class="media-count" *ngIf="post.mediaUrls && post.mediaUrls.length > 1">
            <ng-icon name="lucideImage"></ng-icon>
            <span>+{{ post.mediaUrls.length - 1 }}</span>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="footer-stats">
          <div class="stat-pill" (click)="onLike($event)" [class.liked]="post.likesCount > 0">
            <ng-icon name="lucideThumbsUp"></ng-icon>
            <span>{{ post.likesCount }}</span>
          </div>
          <div class="stat-pill">
            <ng-icon name="lucideMessageSquare"></ng-icon>
            <span>{{ post.comments.length }}</span>
          </div>
          <div class="stat-pill">
            <ng-icon name="lucideEye"></ng-icon>
            <span>{{ post.viewsCount }}</span>
          </div>
        </div>
        <div class="read-more">
          <span>Lire la suite</span>
          <ng-icon name="lucideArrowRight"></ng-icon>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .premium-card {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 20px;
      position: relative;
    }
    
    .card-header { display: flex; gap: 16px; }
    
    .author-avatar {
      width: 48px; height: 48px; border-radius: 14px;
      display: flex; justify-content: center; align-items: center;
      color: var(--co-primary); flex-shrink: 0;
    }
    .author-avatar ng-icon { font-size: 24px; width: 24px; height: 24px; }
    
    .header-texts { flex: 1; min-width: 0; }
    
    .top-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .spacer { flex: 1; }
    
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #94A3B8; }
    .status-dot.open { background: var(--co-success); box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
    .status-text { font-size: 11px; font-weight: 700; color: var(--co-text-muted); text-transform: uppercase; margin-left: 4px; }

    .post-title {
      margin: 0 0 6px 0; font-size: 18px; font-weight: 800;
      color: var(--co-secondary); line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    
    .author-meta { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--co-text-muted); }
    .author-name { font-weight: 600; color: var(--co-text-main); }
    .dot-separator { color: #CBD5E1; }
    
    .card-body { display: flex; gap: 16px; align-items: flex-start; }
    .body-content { flex: 1; }
    .post-excerpt { color: var(--co-text-main); line-height: 1.6; font-size: 14px; margin-bottom: 12px; }
    
    .post-thumbnail { 
      width: 100px; height: 70px; border-radius: 12px; overflow: hidden; 
      flex-shrink: 0; position: relative; border: 1px solid rgba(0,0,0,0.05);
    }
    .post-thumbnail img { width: 100%; height: 100%; object-fit: cover; }
    
    .video-placeholder-mini {
      width: 100%; height: 100%;
      background: linear-gradient(135deg, #1C4FC3 0%, #2563EB 100%);
      display: flex; justify-content: center; align-items: center;
      color: white;
    }
    .video-placeholder-mini ng-icon { font-size: 24px; width: 24px; height: 24px; }
    
    .media-count {
      position: absolute; bottom: 4px; right: 4px;
      background: rgba(0,0,0,0.6); color: white; padding: 2px 6px;
      border-radius: 8px; font-size: 10px; font-weight: 800;
      display: flex; align-items: center; gap: 3px; backdrop-filter: blur(4px);
    }
    
    .tag-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .post-tag { font-size: 11px; font-weight: 700; color: var(--co-primary); background: var(--co-primary-light); padding: 2px 10px; border-radius: 20px; }
    .tag-more { font-size: 11px; font-weight: 700; color: var(--co-text-muted); }
    
    .card-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.04);
    }
    
    .footer-stats { display: flex; gap: 12px; }
    .stat-pill {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 10px;
      font-size: 12px; font-weight: 700; color: var(--co-text-muted);
      transition: all 0.2s ease;
    }
    .stat-pill ng-icon { font-size: 16px; width: 16px; height: 16px; }
    .stat-pill.liked { background: #EEF2FF; color: var(--co-primary); }
    
    .read-more {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 700; color: var(--co-primary);
      transition: all 0.2s ease;
    }
    .premium-card:hover .read-more { transform: translateX(4px); }
  `]
})
export class PostCardComponent {
  @Input() post!: ForumPost;
  @Output() likeClicked = new EventEmitter<string>();
  @Output() clicked = new EventEmitter<string>();

  onLike(event: Event) {
    event.stopPropagation();
    this.likeClicked.emit(this.post.id);
  }

  getStatusBg(): string {
    switch(this.post.status) {
      case 'OPEN': return 'var(--badge-green-bg)';
      case 'RESOLVED': return 'var(--badge-blue-bg)';
      default: return 'var(--surface)';
    }
  }

  getStatusColor(): string {
    switch(this.post.status) {
      case 'OPEN': return 'var(--badge-green-text)';
      case 'RESOLVED': return 'var(--badge-blue-text)';
      default: return 'var(--text-muted)';
    }
  }

  getFirstImageUrl(): string | null {
    if (!this.post.mediaUrls || this.post.mediaUrls.length === 0) return null;
    return this.post.mediaUrls.find(url => this.isImage(url)) || null;
  }

  hasMedia(): boolean {
    return !!(this.post.mediaUrls && this.post.mediaUrls.length > 0);
  }

  isImage(url: string): boolean {
    if (!url) return false;
    return /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url) || url.includes('marketplace/files');
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