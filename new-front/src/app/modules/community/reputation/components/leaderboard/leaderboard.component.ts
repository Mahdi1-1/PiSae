import { Component, OnInit } from '@angular/core';
import { ReputationService } from '../../services/reputation.service';
import { MemberReputation } from '../../../shared/models/reputation.model';

import { SharedModule } from '../../../shared/shared.module';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideUser, lucideAward, lucideSearch, lucideTrophy } from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-leaderboard',
  providers: [
    provideIcons({
      lucideArrowLeft, lucideUser, lucideAward, lucideSearch, lucideTrophy
    })
  ],
  template: `
    <div class="leaderboard-container animate-fade-in-up">
      
      <!-- Header -->
      <div class="header-section glass-panel">
        <button type="button" routerLink="/community/reputation" class="back-btn p-2 rounded-full hover:bg-white/50 transition-colors">
          <ng-icon name="lucideArrowLeft" size="20"></ng-icon>
        </button>
        <div>
          <h1 class="page-title">Classement Communautaire</h1>
          <p class="page-subtitle">Découvrez les contributeurs les plus influents de l'écosystème.</p>
        </div>
      </div>

      <!-- Podiums (Top 3) -->
      <div class="podium-section" *ngIf="leaderboard.length >= 3">
        
        <!-- 2nd Place -->
        <div class="podium-card silver animate-fade-in-up" style="animation-delay: 100ms">
          <div class="podium-rank">🥈</div>
          <div class="podium-avatar">
            <ng-icon name="lucideUser"></ng-icon>
          </div>
          <h3 class="podium-name">Membre {{ leaderboard[1].memberId | slice:0:8 }}</h3>
          <div class="podium-level">{{ leaderboard[1].level }}</div>
          <div class="podium-points">{{ leaderboard[1].points }} <small>pts</small></div>
        </div>

        <!-- 1st Place -->
        <div class="podium-card gold animate-fade-in-up">
          <div class="podium-rank">🏆</div>
          <div class="podium-avatar main">
            <ng-icon name="lucideUser"></ng-icon>
            <div class="crown">👑</div>
          </div>
          <h3 class="podium-name">Membre {{ leaderboard[0].memberId | slice:0:8 }}</h3>
          <div class="podium-level main">{{ leaderboard[0].level }}</div>
          <div class="podium-points main">{{ leaderboard[0].points }} <small>pts</small></div>
        </div>

        <!-- 3rd Place -->
        <div class="podium-card bronze animate-fade-in-up" style="animation-delay: 200ms">
          <div class="podium-rank">🥉</div>
          <div class="podium-avatar">
            <ng-icon name="lucideUser"></ng-icon>
          </div>
          <h3 class="podium-name">Membre {{ leaderboard[2].memberId | slice:0:8 }}</h3>
          <div class="podium-level">{{ leaderboard[2].level }}</div>
          <div class="podium-points">{{ leaderboard[2].points }} <small>pts</small></div>
        </div>

      </div>

      <!-- Rest of Leaderboard -->
      <div class="leaderboard-list">
        <div class="list-header">
          <div class="col-rank">Rang</div>
          <div class="col-member">Membre</div>
          <div class="col-level">Niveau</div>
          <div class="col-score">Score</div>
        </div>

        <div *ngFor="let member of leaderboard | slice:3; let i = index" 
          class="member-row glass-panel hover-lift animate-fade-in-up"
          [style.animation-delay.ms]="(i + 4) * 50">
          
          <div class="col-rank">
            <span class="rank-number">#{{ i + 4 }}</span>
          </div>
          
          <div class="col-member">
            <div class="avatar-mini"><ng-icon name="lucideUser"></ng-icon></div>
            <span class="member-name">Utilisateur {{ member.memberId | slice:0:8 }}</span>
          </div>
          
          <div class="col-level">
            <span class="level-badge" [class]="member.level.toLowerCase()">
              {{ member.level }}
            </span>
          </div>
          
          <div class="col-score">
            <span class="points-val">{{ member.points }}</span>
            <span class="points-unit">pts</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="leaderboard.length === 0" class="empty-state glass-panel">
        <ng-icon name="lucideTrophy" size="48" class="text-slate-200 mb-4"></ng-icon>
        <h3>Aucune donnée disponible</h3>
        <p>Le classement sera bientôt mis à jour.</p>
      </div>

    </div>
  `,
  styles: [`
    .leaderboard-container { max-width: 1000px; margin: 40px auto; padding: 0 16px; min-height: 80vh; }
    
    .header-section { 
      display: flex; align-items: center; gap: 20px;
      padding: 32px 40px; border-radius: 24px; margin-bottom: 48px;
      background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%);
      border: none;
    }
    .back-btn { color: #475569; }
    .page-title { margin: 0; font-size: 32px; font-weight: 800; color: #1E293B; letter-spacing: -1px; }
    .page-subtitle { margin: 6px 0 0; color: #64748B; font-size: 15px; }

    /* Podium Styles */
    .podium-section {
      display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 24px;
      align-items: flex-end; margin-bottom: 64px; padding: 0 40px;
    }
    
    .podium-card {
      background: white; border-radius: 32px; padding: 40px 24px 32px;
      text-align: center; border: 1px solid rgba(0,0,0,0.04);
      box-shadow: 0 20px 40px -20px rgba(0,0,0,0.05);
      position: relative; transition: all 0.3s ease;
    }
    .podium-card:hover { transform: translateY(-10px); box-shadow: 0 30px 60px -20px rgba(0,0,0,0.1); }
    
    .podium-card.gold { border: 2px solid #FEF08A; padding-bottom: 48px; }
    .podium-card.silver { border: 2px solid #E2E8F0; }
    .podium-card.bronze { border: 2px solid #FED7AA; }
    
    .podium-rank { font-size: 40px; margin-bottom: 16px; }
    
    .podium-avatar {
      width: 64px; height: 64px; border-radius: 20px; margin: 0 auto 16px;
      background: #F8FAFC; color: #94A3B8; display: flex;
      justify-content: center; align-items: center; position: relative;
    }
    .podium-avatar.main { width: 80px; height: 80px; border-radius: 24px; background: #FEFCE8; color: #CA8A04; }
    .podium-avatar.main ng-icon { font-size: 40px; width: 40px; height: 40px; }
    .podium-avatar ng-icon { font-size: 32px; width: 32px; height: 32px; }
    
    .crown { position: absolute; top: -20px; font-size: 24px; }
    
    .podium-name { font-size: 16px; font-weight: 800; color: #1E293B; margin-bottom: 4px; }
    .podium-level { font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 12px; }
    .podium-level.main { color: #CA8A04; }
    
    .podium-points { font-size: 24px; font-weight: 900; color: #475569; }
    .podium-points.main { font-size: 32px; color: #1E293B; }
    .podium-points small { font-size: 12px; font-weight: 700; opacity: 0.6; }

    /* List Styles */
    .leaderboard-list { background: white; border-radius: 32px; padding: 24px; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }
    
    .list-header { display: flex; padding: 12px 24px; font-size: 12px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }
    
    .member-row { display: flex; align-items: center; padding: 20px 24px; margin-bottom: 8px; border-radius: 20px; border: 1px solid transparent; }
    .member-row:hover { border-color: #DBEAFE; background: #F8FAFC; }
    
    .col-rank { width: 80px; }
    .rank-number { font-weight: 800; color: #94A3B8; font-size: 14px; }
    
    .col-member { flex: 2; display: flex; align-items: center; gap: 16px; }
    .avatar-mini { width: 40px; height: 40px; border-radius: 12px; background: #F1F5F9; color: #64748B; display: flex; justify-content: center; align-items: center; }
    .member-name { font-weight: 700; color: #1E293B; }
    
    .col-level { flex: 1; }
    .level-badge { font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; }
    .explorateur { background: #EEF2FF; color: #4F46E5; }
    .contributeur { background: #ECFDF5; color: #059669; }
    .expert { background: #FFF7ED; color: #EA580C; }
    .leader { background: #FAF5FF; color: #9333EA; }
    .ambassadeur { background: #FEFCE8; color: #CA8A04; }
    
    .col-score { width: 120px; text-align: right; }
    .points-val { font-size: 18px; font-weight: 800; color: #1E293B; margin-right: 4px; }
    .points-unit { font-size: 11px; font-weight: 700; color: #94A3B8; }

    .empty-state { text-align: center; padding: 80px 40px; border-radius: 32px; border: 1px dashed #CBD5E1; }
    
    @media (max-width: 768px) {
      .podium-section { grid-template-columns: 1fr; gap: 16px; padding: 0; }
      .podium-card.gold { order: -1; }
      .list-header { display: none; }
      .col-level { display: none; }
    }
  `]
})
export class LeaderboardComponent implements OnInit {

  leaderboard: MemberReputation[] = [];

  constructor(private reputationService: ReputationService) {}

  ngOnInit() {
    this.reputationService.getLeaderboard().subscribe(
      data => this.leaderboard = data
    );
  }

  getRankClass(index: number): string {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return 'bronze';
    return '';
  }
}