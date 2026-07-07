import { Component, OnInit } from '@angular/core';
import { ReputationService } from '../../services/reputation.service';
import { MemberReputation } from '../../../shared/models/reputation.model';
import { AuthService } from '../../../../../core/services/auth.service';
import { Router } from '@angular/router';

import { SharedModule } from '../../../shared/shared.module';
import { BadgesComponent } from '../badges/badges.component';
import { provideIcons } from '@ng-icons/core';
import { 
  lucideTrophy, lucideMessageSquare, lucideMessageCircle, 
  lucideLibrary, lucideStar, lucideLoader, lucideAlertCircle 
} from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-reputation-card',
  providers: [
    provideIcons({
      lucideTrophy, lucideMessageSquare, lucideMessageCircle, 
      lucideLibrary, lucideStar, lucideLoader, lucideAlertCircle 
    })
  ],
  template: `
    <div class="reputation-container animate-fade-in-up">

      <!-- Header -->
      <div class="rep-header glass-panel">
        <div>
          <h1 class="page-title">Ma Réputation</h1>
          <p class="page-subtitle">Suivez votre impact et progressez dans la communauté.</p>
        </div>
        <button class="leaderboard-btn hover-lift flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-full transition-colors shadow-lg shadow-blue-200" routerLink="/community/reputation/leaderboard">
          <ng-icon name="lucideTrophy"></ng-icon> <span>Leaderboard</span>
        </button>
      </div>

      <!-- Main Content -->
      <div *ngIf="reputation && !loading">
        <!-- Score Card -->
        <div class="score-card glass-panel hover-lift animate-fade-in-up">
          <div class="score-grid">

            <div class="score-main">
              <div class="level-badge" [class]="reputation.level.toLowerCase()">
                {{ reputation.level }}
              </div>
              <div class="points">{{ reputation.points }} <span class="pts-label">pts</span></div>
              <div class="global-score">Score global : {{ reputation.globalScore | number:'1.0-1' }} / 100</div>
            </div>

            <div class="score-details border-left">
              <div class="score-item">
                <span class="score-label">Expertise</span>
                <div class="progress-bar-wrapper">
                  <div class="progress-fill expertise-fill" [style.width.%]="reputation.expertiseScore"></div>
                </div>
                <span class="score-value">{{ reputation.expertiseScore | number:'1.0-1' }}</span>
              </div>
              <div class="score-item">
                <span class="score-label">Réactivité</span>
                <div class="progress-bar-wrapper">
                  <div class="progress-fill reactivity-fill" [style.width.%]="reputation.reactivityScore"></div>
                </div>
                <span class="score-value">{{ reputation.reactivityScore | number:'1.0-1' }}</span>
              </div>
              <div class="score-item">
                <span class="score-label">Valeur ajoutée</span>
                <div class="progress-bar-wrapper">
                  <div class="progress-fill value-fill" [style.width.%]="reputation.valueScore"></div>
                </div>
                <span class="score-value">{{ reputation.valueScore | number:'1.0-1' }}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card glass-panel hover-lift animate-fade-in-up" style="animation-delay: 100ms">
            <div class="stat-icon bg-blue"><ng-icon name="lucideMessageSquare"></ng-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ reputation.postsCount }}</div>
              <div class="stat-label">Posts publiés</div>
            </div>
          </div>
          <div class="stat-card glass-panel hover-lift animate-fade-in-up" style="animation-delay: 200ms">
            <div class="stat-icon bg-green"><ng-icon name="lucideMessageCircle"></ng-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ reputation.commentsCount }}</div>
              <div class="stat-label">Commentaires</div>
            </div>
          </div>
          <div class="stat-card glass-panel hover-lift animate-fade-in-up" style="animation-delay: 300ms">
            <div class="stat-icon bg-orange"><ng-icon name="lucideLibrary"></ng-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ reputation.resourcesPublished }}</div>
              <div class="stat-label">Ressources</div>
            </div>
          </div>
          <div class="stat-card glass-panel hover-lift animate-fade-in-up" style="animation-delay: 400ms">
            <div class="stat-icon bg-purple"><ng-icon name="lucideStar"></ng-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ reputation.recommendationsReceived }}</div>
              <div class="stat-label">Recommandations</div>
            </div>
          </div>
        </div>

        <!-- Badges -->
        <app-badges [badges]="reputation.badges"></app-badges>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="spinner-container flex flex-col items-center justify-center py-24 text-slate-400">
        <ng-icon name="lucideLoader" class="animate-spin mb-4" size="48"></ng-icon>
        <p class="font-medium text-lg">Analyse de vos performances...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-state glass-panel p-12 text-center animate-scale-in">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-6">
          <ng-icon name="lucideAlertCircle" size="32"></ng-icon>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">Oups ! Quelque chose s'est mal passé</h3>
        <p class="text-slate-500 mb-8">{{ error }}</p>
        <button (click)="loadReputation()" class="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all">
          Réessayer
        </button>
      </div>

    </div>
  `,
  styles: [`
    .reputation-container { max-width: 900px; margin: 40px auto; padding: 0 16px; min-height: 80vh; }
    
    .rep-header { 
      display: flex; justify-content: space-between; align-items: center; 
      padding: 32px 40px; border-radius: 24px; margin-bottom: 32px;
      background: linear-gradient(135deg, #FEFCE8 0%, #FEF08A 50%, #FDE68A 100%);
      border: none;
    }
    .page-title { margin: 0; font-size: 32px; font-weight: 800; color: #1E293B; letter-spacing: -1px; }
    .page-subtitle { margin: 6px 0 0; color: #64748B; font-size: 15px; }
    
    .score-card { padding: 40px; border-radius: 24px; background: white; margin-bottom: 32px; border: 1px solid rgba(0,0,0,0.05); }
    .score-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 48px; align-items: center; }
    
    .score-main { text-align: center; }
    .level-badge { padding: 10px 28px; border-radius: 99px; font-weight: 800; font-size: 14px; margin-bottom: 20px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; }
    
    .explorateur { background: #EEF2FF; color: #4F46E5; }
    .contributeur { background: #ECFDF5; color: #059669; }
    .expert { background: #FFF7ED; color: #EA580C; }
    .leader { background: #FAF5FF; color: #9333EA; }
    .ambassadeur { background: #FEFCE8; color: #CA8A04; }
    
    .points { font-size: 56px; font-weight: 800; color: #1E293B; line-height: 1; margin-bottom: 12px; }
    .pts-label { font-size: 18px; font-weight: 700; color: #64748B; }
    .global-score { color: #64748B; font-size: 14px; font-weight: 600; }
    
    .border-left { border-left: 2px solid #F1F5F9; padding-left: 48px; }
    
    .score-item { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
    .score-item:last-child { margin-bottom: 0; }
    .score-label { width: 130px; font-size: 14px; font-weight: 700; color: #475569; }
    
    .progress-bar-wrapper { flex: 1; height: 12px; background: #F1F5F9; border-radius: 99px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 99px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
    .expertise-fill { background: linear-gradient(90deg, #3B82F6, #60A5FA); }
    .reactivity-fill { background: linear-gradient(90deg, #10B981, #34D399); }
    .value-fill { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
    
    .score-value { width: 44px; text-align: right; font-weight: 800; color: #1E293B; font-size: 15px; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .stat-card { background: white; padding: 24px; border-radius: 20px; display: flex; align-items: center; gap: 20px; border: 1px solid rgba(0,0,0,0.05); }
    
    .stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; justify-content: center; align-items: center; color: white; }
    .stat-icon ng-icon { font-size: 28px; width: 28px; height: 28px; }
    .bg-blue { background: #3B82F6; box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.3); }
    .bg-green { background: #10B981; box-shadow: 0 8px 16px -4px rgba(16, 185, 129, 0.3); }
    .bg-orange { background: #F59E0B; box-shadow: 0 8px 16px -4px rgba(245, 158, 11, 0.3); }
    .bg-purple { background: #8B5CF6; box-shadow: 0 8px 16px -4px rgba(139, 92, 246, 0.3); }
    
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 800; color: #1E293B; line-height: 1.2; }
    .stat-label { color: #64748B; font-size: 13px; font-weight: 600; }

    .error-state { border-radius: 24px; background: white; border: 1px solid rgba(239, 68, 68, 0.1); }
    
    @media (max-width: 768px) {
      .score-grid { grid-template-columns: 1fr; gap: 32px; }
      .border-left { border-left: none; padding-left: 0; padding-top: 32px; border-top: 2px solid #F1F5F9; }
      .rep-header { flex-direction: column; align-items: flex-start; gap: 20px; }
    }
  `]
})
export class ReputationCardComponent implements OnInit {

  reputation: MemberReputation | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private reputationService: ReputationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadReputation();
  }

  loadReputation() {
    const userId = this.authService.getUserId()?.toString();
    if (!userId) {
      this.error = "Utilisateur non identifié.";
      this.loading = false;
      return;
    }

    this.loading = true;
    this.reputationService.getReputation(userId).subscribe({
      next: (rep) => {
        this.reputation = rep;
        this.loading = false;
        this.error = null;
      },
      error: (err) => {
        console.error('Error fetching reputation:', err);
        if (err.status === 404) {
          this.initializeReputation(userId);
        } else {
          this.error = "Impossible de charger votre réputation. Vérifiez votre connexion.";
          this.loading = false;
        }
      }
    });
  }

  private initializeReputation(userId: string) {
    this.reputationService.initReputation(userId).subscribe({
      next: (rep) => {
        this.reputation = rep;
        this.loading = false;
        this.error = null;
      },
      error: (err) => {
        console.error('Error initializing reputation:', err);
        this.error = "Erreur lors de la création de votre profil de réputation.";
        this.loading = false;
      }
    });
  }
}