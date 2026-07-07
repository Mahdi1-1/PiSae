import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { ForumPost, Comment } from '../../../shared/models/forum-post.model';
import { AuthService } from '../../../../../core/services/auth.service';
import { environment } from '../../../../../../environments/environment';
import { SharedModule } from '../../../shared/shared.module';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { provideIcons } from '@ng-icons/core';
import { 
  lucideArrowLeft, lucideUser, lucideThumbsUp, lucideCheckCircle,
  lucideEdit, lucideTrash2, lucideSave, lucideMessageSquare,
  lucideCornerDownRight, lucideSend, lucideLoader2, lucideFilm, lucideImage, lucideX, lucidePlayCircle, lucideEye
} from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-post-detail',
  providers: [
    provideIcons({
      lucideArrowLeft, lucideUser, lucideThumbsUp, lucideCheckCircle,
      lucideEdit, lucideTrash2, lucideSave, lucideMessageSquare,
      lucideCornerDownRight, lucideSend, lucideLoader2, lucideFilm, lucideImage, lucideX, lucidePlayCircle, lucideEye
    })
  ],
  template: `
    <div class="detail-container animate-fade-in-up" *ngIf="post">

      <button type="button" routerLink="/community/forum" class="back-btn flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors">
        <ng-icon name="lucideArrowLeft" size="20"></ng-icon>
      </button>

      <div class="post-content-card glass-panel">
        <div class="header-section">
          <div class="author-avatar"><ng-icon name="lucideUser"></ng-icon></div>
          <div class="meta-info">
            <span class="author-name">Par {{ post.authorName || post.authorId }}</span>
            <span class="sector-badge">{{ post.sector }}</span>
            <div class="status-wrap">
              <span class="date">{{ post.createdAt | date:'dd MMM yyyy, HH:mm' }}</span>
              <span class="status-indicator" [class]="post.status.toLowerCase()">
                {{ post.status === 'OPEN' ? 'Ouvert' : post.status === 'RESOLVED' ? 'Résolu' : 'Archivé' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Mode lecture -->
        <ng-container *ngIf="!isEditing">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="main-content">
            <p>{{ post.content }}</p>
          </div>
          <div class="tags" *ngIf="post.tags && post.tags.length > 0">
            <span *ngFor="let tag of post.tags" class="tag-chip">#{{ tag }}</span>
          </div>

          <!-- Media Display -->
          <div class="media-grid" *ngIf="post.mediaUrls && post.mediaUrls.length > 0" [class.single]="post.mediaUrls.length === 1">
            <div *ngFor="let url of post.mediaUrls" class="media-wrapper hover-lift">
              <ng-container *ngIf="isImage(url)">
                <div class="image-container" (click)="openMedia(getFullUrl(url))">
                  <img [src]="getFullUrl(url)" alt="Media post" class="post-image">
                  <div class="image-overlay">
                    <ng-icon name="lucideEye" size="24"></ng-icon>
                  </div>
                </div>
              </ng-container>
              <ng-container *ngIf="isVideo(url)">
                <div class="video-wrapper glass-panel">
                  <iframe [src]="getSafeVideoUrl(url)" frameborder="0" allowfullscreen></iframe>
                </div>
              </ng-container>
            </div>
          </div>

          <div class="action-bar">
            <button class="like-btn flex items-center gap-2" (click)="likePost()" [class.liked]="post.likesCount > 0">
              <ng-icon name="lucideThumbsUp"></ng-icon> <span>{{ post.likesCount }} J'aime</span>
            </button>
            <ng-container *ngIf="isOwner">
              <button class="flex items-center gap-2 text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-full transition-colors" (click)="resolvePost()" *ngIf="post.status !== 'RESOLVED'">
                <ng-icon name="lucideCheckCircle"></ng-icon> Résoudre
              </button>
              <button class="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors" (click)="toggleEdit()">
                <ng-icon name="lucideEdit"></ng-icon> Modifier
              </button>
              <button class="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors" (click)="deletePost()">
                <ng-icon name="lucideTrash2"></ng-icon> Supprimer
              </button>
            </ng-container>
          </div>
        </ng-container>

        <!-- Mode édition -->
        <ng-container *ngIf="isEditing">
          <div class="flex flex-col gap-1 w-full mb-4">
            <label class="text-sm font-medium text-gray-700">Titre</label>
            <input [(ngModel)]="editTitle" class="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div class="flex flex-col gap-1 w-full mb-4">
            <label class="text-sm font-medium text-gray-700">Contenu</label>
            <textarea [(ngModel)]="editContent" rows="5" class="flex min-h-[80px] w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"></textarea>
          </div>
          <div class="edit-actions">
            <button class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors" (click)="toggleEdit()">Annuler</button>
            <button class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors" (click)="updatePost()">
              <ng-icon name="lucideSave"></ng-icon> Sauvegarder
            </button>
          </div>
        </ng-container>
      </div>

      <!-- Comments -->
      <div class="comments-section">
        <h3 class="comments-title">Commentaires ({{ post.comments.length }})</h3>

        <div class="comment-thread">
          <div *ngFor="let comment of post.comments || []; let i = index" class="comment-bubble hover-lift">
            <div class="comment-header">
              <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><ng-icon name="lucideUser"></ng-icon></div>
              <strong class="comment-author">{{ comment.authorName || comment.authorId }}</strong>
              <span class="comment-date">{{ comment.createdAt | date:'dd MMM yyyy HH:mm' }}</span>
            </div>
            <p class="comment-text">{{ comment.content }}</p>
            <div class="comment-actions">
              <button class="reply-link flex items-center gap-1" (click)="toggleReplyTo(i)">
                <ng-icon name="lucideCornerDownRight"></ng-icon> Répondre
              </button>
            </div>

            <!-- Reply box for this comment -->
            <div *ngIf="replyingTo === i" class="reply-box mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <textarea [(ngModel)]="replyContent" rows="2" placeholder="Votre réponse..." class="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"></textarea>
              <div class="reply-actions flex justify-end gap-2 mt-2">
                <button class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors" (click)="cancelReply()">Annuler</button>
                <button class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                  [disabled]="!replyContent.trim()"
                  (click)="addReply(i)">
                  <ng-icon name="lucideSend"></ng-icon> Envoyer
                </button>
              </div>
            </div>

            <!-- Nested replies -->
            <div *ngIf="comment.replies && comment.replies.length > 0" class="replies-nest mt-4 ml-6 pl-4 border-l-2 border-gray-200">
              <div *ngFor="let reply of comment.replies" class="nested-comment bg-gray-50 p-3 rounded-lg mb-3">
                <div class="reply-header flex items-center gap-2 mb-1">
                  <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><ng-icon name="lucideCornerDownRight" size="14"></ng-icon></div>
                  <strong class="reply-author text-sm text-gray-600">{{ reply.authorName || reply.authorId }}</strong>
                  <span class="reply-date text-xs text-gray-400">{{ reply.createdAt | date:'dd MMM yyyy HH:mm' }}</span>
                </div>
                <p class="reply-text text-sm text-gray-700 mt-1">{{ reply.content }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Add main comment -->
        <div class="add-comment-box glass-panel p-6 bg-white rounded-2xl border border-gray-100">
          <textarea [(ngModel)]="newComment" rows="3" placeholder="Votre commentaire..." class="flex w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"></textarea>
          <div class="submit-action flex justify-end mt-4">
            <button class="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50"
              [disabled]="!newComment.trim()"
              (click)="addComment()">
              <ng-icon name="lucideSend"></ng-icon> Ajouter un commentaire
            </button>
          </div>
        </div>
      </div>

    </div>

    <div *ngIf="!post" class="spinner-container flex justify-center py-12">
      <ng-icon name="lucideLoader2" class="animate-spin text-blue-500" size="40"></ng-icon>
    </div>
  `,
  styles: [`
    .detail-container { max-width: 800px; margin: 40px auto; padding: 0 16px; min-height: 80vh; }
    .back-btn { margin-bottom: 16px; background: white; box-shadow: var(--shadow-sm); width: max-content; }

    .post-content-card { padding: 32px; border-radius: 16px; margin-bottom: 32px; background: white; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .author-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--co-primary-light); color: var(--co-primary); display: flex; justify-content: center; align-items: center; font-size: 24px; }
    .author-avatar ng-icon { font-size: 24px; width: 24px; height: 24px; }
    .meta-info { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .sector-badge { background: var(--co-background); color: var(--co-text-muted); padding: 4px 12px; border-radius: 12px; font-weight: 600; font-size: 12px; }
    .date { color: #94A3B8; font-size: 13px; }

    .post-title { font-size: 32px; font-weight: 800; color: var(--co-secondary); margin: 0 0 24px 0; line-height: 1.2; }
    .main-content { font-size: 18px; line-height: 1.7; color: #334155; margin-bottom: 24px; }

    .tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
    .tag-chip { font-size: 14px; color: var(--co-primary); font-weight: 500; background: var(--co-primary-light); padding: 4px 12px; border-radius: 16px; }

    .action-bar { border-top: 1px solid var(--co-background); padding-top: 16px; display: flex; gap: 8px; align-items: center; }
    .like-btn { padding: 6px 16px; border-radius: 20px; font-weight: 600; color: var(--co-text-muted); transition: background 0.2s, color 0.2s; }
    .like-btn.liked { color: var(--co-primary); background: var(--co-primary-light); }
    .like-btn:hover:not(.liked) { background: #F1F5F9; }

    .edit-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }

    .status-wrap { display: flex; align-items: center; gap: 12px; }
    .status-indicator { font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 12px; }
    .status-indicator.open { background: #ECFDF5; color: #059669; }
    .status-indicator.resolved { background: #EFF6FF; color: #2563EB; }
    .status-indicator.archived { background: #F1F5F9; color: #64748B; }

    .media-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
      gap: 16px; 
      margin: 24px 0; 
    }
    .media-grid.single { grid-template-columns: 1fr; }
    
    .media-wrapper { 
      border-radius: 16px; 
      overflow: hidden; 
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      background: #F8FAFC;
    }
    
    .image-container { 
      position: relative; 
      cursor: pointer; 
      width: 100%; 
      height: 100%;
      min-height: 250px;
    }
    
    .post-image { 
      width: 100%; 
      height: 100%; 
      object-fit: cover; 
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
    }
    
    .image-overlay {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(28, 79, 195, 0.2);
      display: flex; justify-content: center; align-items: center;
      opacity: 0; transition: all 0.3s ease;
      color: white; backdrop-filter: blur(2px);
    }
    
    .image-container:hover .image-overlay { opacity: 1; }
    .image-container:hover .post-image { transform: scale(1.05); }
    
    .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 16px; }
    .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

    .comments-section { margin-top: 40px; }
    .comments-title { font-size: 20px; font-weight: 700; color: var(--co-secondary); margin-bottom: 24px; }

    .comment-thread { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
    .comment-bubble { background: white; border-radius: 12px; padding: 16px 20px; box-shadow: var(--shadow-sm); border-left: 4px solid var(--co-primary); }
    .comment-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .comment-author { font-size: 14px; color: var(--co-secondary); }
    .comment-date { font-size: 12px; color: #94A3B8; }
    .comment-text { margin: 8px 0; color: #475569; line-height: 1.5; font-size: 15px; }
    
    .comment-actions { margin-top: 12px; }
    .reply-link { font-size: 12px; font-weight: 600; color: var(--co-primary); background: transparent; padding: 4px 8px; border-radius: 6px; transition: background 0.2s; }
    .reply-link:hover { background: var(--co-primary-light); }
  `]
})
export class PostDetailComponent implements OnInit {

  post: ForumPost | null = null;
  newComment = '';
  replyContent = '';
  postId = '';
  currentUserId = '';
  isOwner = false;
  isEditing = false;
  editTitle = '';
  editContent = '';
  replyingTo: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private forumService: ForumService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id') || '';
    this.currentUserId = this.authService.getUserId()?.toString() || '';
    this.loadPost();
  }

  loadPost() {
    this.forumService.getAllPosts().subscribe(posts => {
      this.post = posts.find(p => p.id === this.postId) || null;
      if (this.post) {
        this.isOwner = this.post.authorId === this.currentUserId;
        this.editTitle = this.post.title;
        this.editContent = this.post.content;
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  updatePost() {
    if (!this.post) return;
    const dto = {
      title: this.editTitle,
      content: this.editContent,
      tags: this.post.tags,
      sector: this.post.sector,
      authorId: this.currentUserId,
      mediaUrls: this.post.mediaUrls
    };
    this.forumService.updatePost(this.postId, dto).subscribe({
      next: updated => {
        this.post = updated;
        this.isEditing = false;
        alert('Post mis à jour !');
      },
      error: () => {
        alert('Erreur lors de la mise à jour');
      }
    });
  }

  deletePost() {
    this.forumService.deletePost(this.postId).subscribe({
      next: () => {
        alert('Post supprimé !');
        this.router.navigate(['/community/forum']);
      },
      error: () => {
        alert('Erreur lors de la suppression');
      }
    });
  }

  likePost() {
    const userId = this.authService.getUserId()?.toString() || '';
    this.forumService.likePost(this.postId, userId).subscribe({
      next: updated => {
        this.post = updated;
      },
      error: () => {
        alert('Erreur lors du vote');
      }
    });
  }

  addComment() {
    const comment: Comment = {
      authorId: this.authService.getUserId()?.toString() || '',
      content: this.newComment,
      createdAt: new Date().toISOString()
    };
    this.forumService.addComment(this.postId, comment).subscribe({
      next: updated => {
        this.post = updated;
        this.newComment = '';
      },
      error: () => {
        alert('Erreur lors de l\'ajout du commentaire');
      }
    });
  }

  toggleReplyTo(commentIndex: number) {
    this.replyingTo = this.replyingTo === commentIndex ? null : commentIndex;
    this.replyContent = '';
  }

  cancelReply() {
    this.replyingTo = null;
    this.replyContent = '';
  }

  addReply(commentIndex: number) {
    const reply: Comment = {
      authorId: this.authService.getUserId()?.toString() || '',
      content: this.replyContent,
      createdAt: new Date().toISOString()
    };
    this.forumService.addReplyToComment(this.postId, commentIndex, reply).subscribe({
      next: updated => {
        this.post = updated;
        this.replyContent = '';
        this.replyingTo = null;
      },
      error: () => {
        alert('Erreur lors de l\'ajout de la réponse');
      }
    });
  }

  resolvePost() {
    if (!this.postId) return;
    this.forumService.updatePostStatus(this.postId, 'RESOLVED').subscribe({
      next: updated => {
        this.post = updated;
        alert('✅ Post marqué comme résolu ! +15 points de réputation');
      }
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

  getSafeVideoUrl(url: string): SafeResourceUrl {
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('/').pop()?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('vimeo.com/')) {
      const videoId = url.split('/').pop()?.split('?')[0];
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  openMedia(url: string) {
    window.open(url, '_blank');
  }

  getFullUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.apiGatewayUrl}${url}`;
  }
}