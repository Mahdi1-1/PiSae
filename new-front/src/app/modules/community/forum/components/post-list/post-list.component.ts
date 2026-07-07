import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ForumPost } from '../../../shared/models/forum-post.model';
import { ForumService } from '../../services/forum.service';
import { GroupService } from '../../services/group.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSearch, lucideMessageSquare, lucideFilter, lucideHash } from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-post-list',
  providers: [
    provideIcons({ lucidePlus, lucideSearch, lucideMessageSquare, lucideFilter, lucideHash })
  ],
  template: `
    <div class="page-container animate-fade-in">
      
      <!-- Premium Header -->
      <div class="header-section glass-panel">
        <div class="header-content">
          <h1 class="page-title">Forum Communautaire</h1>
          <p class="page-subtitle">Échangez, découvrez et grandissez avec les membres de l'écosystème.</p>
        </div>
        <button class="create-btn hover-lift" routerLink="/community/forum/create">
          <ng-icon name="lucidePlus"></ng-icon>
          <span>Lancer une discussion</span>
        </button>
      </div>

      <!-- Discovery Toolbar -->
      <div class="toolbar-section">
        <div class="search-box">
          <ng-icon name="lucideSearch" class="search-icon"></ng-icon>
          <input 
            type="text" 
            [(ngModel)]="searchKeyword" 
            (keyup.enter)="search()" 
            placeholder="Rechercher par titre, contenu ou tag..." />
        </div>

        <div class="filter-chips-container">
          <div class="filter-label">
            <ng-icon name="lucideFilter"></ng-icon>
            <span>Secteurs</span>
          </div>
          <div class="chips-scroll">
            <button 
              class="chip" 
              [class.active]="!selectedSector"
              (click)="filterBySector('')">
              Tous
            </button>
            <button *ngFor="let s of sectors"
              class="chip"
              [class.active]="selectedSector === s"
              (click)="filterBySector(s)">
              {{ s }}
            </button>
          </div>
        </div>
      </div>

      <!-- Posts Feed -->
      <div class="feed-section">
        <div *ngIf="loading" class="loading-state">
          <div class="skeleton-card" *ngFor="let i of [1,2,3]"></div>
        </div>

        <div class="posts-grid" *ngIf="!loading">
          <app-post-card
            *ngFor="let post of posts; let i = index"
            [style.animation-delay.ms]="i * 50"
            [post]="post"
            (likeClicked)="likePost($event)"
            (clicked)="goToPost($event)">
          </app-post-card>
        </div>

        <div *ngIf="!loading && posts.length === 0" class="empty-feed glass-panel animate-scale-in">
          <div class="empty-icon">
            <ng-icon name="lucideMessageSquare"></ng-icon>
          </div>
          <h3>Aucune discussion trouvée</h3>
          <p>Soyez le premier à partager vos idées ou posez une question à la communauté.</p>
          <button class="create-btn mt-6" routerLink="/community/forum/create">
            Lancer le premier post
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 40px auto; padding: 0 16px; }

    .header-section {
      display: flex; justify-content: space-between; align-items: center;
      padding: 32px 40px; border-radius: 24px; margin-bottom: 40px;
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      border: 1px solid rgba(0,0,0,0.02);
    }
    
    .page-title { margin: 0; font-size: 32px; font-weight: 800; color: #1E293B; letter-spacing: -1px; }
    .page-subtitle { margin: 6px 0 0; color: #64748B; font-size: 15px; }

    .create-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 24px; border-radius: 14px;
      background: #1C4FC3; color: white; border: none;
      font-weight: 700; font-size: 14px;
      transition: all 0.3s ease;
      box-shadow: 0 10px 20px -10px rgba(28, 79, 195, 0.4);
    }
    .create-btn:hover { background: #1541A8; transform: translateY(-2px); box-shadow: 0 15px 30px -10px rgba(28, 79, 195, 0.5); }

    .toolbar-section { display: flex; flex-direction: column; gap: 20px; margin-bottom: 40px; }
    
    .search-box {
      position: relative; width: 100%;
    }
    .search-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: #94A3B8; font-size: 18px; }
    .search-box input {
      width: 100%; height: 56px; border-radius: 18px;
      padding: 0 24px 0 52px; border: 1px solid rgba(0,0,0,0.05);
      background: white; font-size: 15px; font-weight: 500;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
    }
    .search-box input:focus { border-color: #1C4FC3; box-shadow: 0 10px 20px -10px rgba(28, 79, 195, 0.15); outline: none; }

    .filter-chips-container { display: flex; align-items: center; gap: 16px; overflow: hidden; }
    .filter-label { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; flex-shrink: 0; }
    
    .chips-scroll { display: flex; gap: 10px; overflow-x: auto; padding: 4px 0; }
    .chips-scroll::-webkit-scrollbar { display: none; }
    
    .chip {
      padding: 8px 18px; border-radius: 12px; background: white;
      border: 1px solid rgba(0,0,0,0.05); font-size: 13px; font-weight: 700;
      color: #64748B; cursor: pointer; transition: all 0.2s ease;
      white-space: nowrap;
    }
    .chip:hover { border-color: #CBD5E1; background: #F8FAFC; }
    .chip.active { background: #1C4FC3; color: white; border-color: #1C4FC3; box-shadow: 0 4px 12px rgba(28, 79, 195, 0.2); }

    .posts-grid { display: flex; flex-direction: column; gap: 20px; }

    .empty-feed {
      text-align: center; padding: 80px 40px; border-radius: 24px;
      display: flex; flex-direction: column; align-items: center;
    }
    .empty-icon {
      width: 80px; height: 80px; border-radius: 24px;
      background: #F1F5F9; color: #94A3B8;
      display: flex; justify-content: center; align-items: center;
      margin-bottom: 24px;
    }
    .empty-icon ng-icon { font-size: 40px; width: 40px; height: 40px; }
    .empty-feed h3 { font-size: 22px; font-weight: 800; color: #1E293B; margin-bottom: 8px; }
    .empty-feed p { color: #64748B; max-width: 400px; line-height: 1.6; }

    .loading-state { display: flex; flex-direction: column; gap: 20px; }
    .skeleton-card { height: 180px; border-radius: 24px; background: linear-gradient(90deg, #F1F5F9 0%, #F8FAFC 50%, #F1F5F9 100%); background-size: 200% 100%; animation: shimmer 2s infinite linear; }
    
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    
    @media (max-width: 768px) {
      .header-section { flex-direction: column; align-items: flex-start; gap: 24px; padding: 32px; }
      .filter-chips-container { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class PostListComponent implements OnInit {

  posts: ForumPost[] = [];
  loading = false;
  searchKeyword = '';
  selectedSector = '';

  groupId: string | null = null;
  sectors = ['FinTech', 'AgriTech', 'EdTech', 'GreenTech', 'HealthTech', 'E-Commerce'];

  constructor(
    private forumService: ForumService,
    private groupService: GroupService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get('groupId');
      this.loadPosts();
    });
  }

  loadPosts() {
    this.loading = true;
    if (this.groupId) {
      this.groupService.getGroupById(this.groupId).subscribe({
        next: group => {
          this.forumService.getAllPosts().subscribe({
            next: posts => {
              this.posts = posts.filter(p => p.groupId === this.groupId);
              this.loading = false;
            },
            error: () => this.loading = false
          });
        },
        error: () => this.loading = false
      });
    } else {
      this.forumService.getAllPosts().subscribe({
        next: posts => { this.posts = posts; this.loading = false; },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  search() {
    if (!this.searchKeyword.trim()) { this.loadPosts(); return; }
    this.loading = true;
    this.forumService.searchPosts(this.searchKeyword).subscribe({
      next: posts => { this.posts = posts; this.loading = false; },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterBySector(sector: string) {
    this.selectedSector = sector;
    if (!sector) { this.loadPosts(); return; }
    this.loading = true;
    this.forumService.getPostsBySector(sector).subscribe({
      next: posts => { this.posts = posts; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  likePost(postId: string) {
    const userId = this.authService.getUserId()?.toString() || '';
    this.forumService.likePost(postId, userId).subscribe({
      next: updated => {
        const index = this.posts.findIndex(p => p.id === postId);
        if (index !== -1) this.posts[index] = updated;
      }
    });
  }

  goToPost(postId: string) {
    this.router.navigate(['/community/forum', postId]);
  }
}