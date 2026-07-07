import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { Opportunity } from '../../../shared/models/opportunity.model';
import { AuthService } from '../../../../../core/services/auth.service';
import { provideIcons } from '@ng-icons/core';
import { 
  lucideArrowLeft, lucidePlus, lucideCheckCircle, lucideHourglass,
  lucideEye, lucideUsers, lucideBriefcase, lucideMapPin,
  lucideClock, lucideHelpCircle, lucideSparkles, lucideTrophy,
  lucidePauseCircle, lucideTrash2, lucideArrowRight, lucideBriefcaseBusiness
} from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-publisher-dashboard',
  providers: [
    provideIcons({
      lucideArrowLeft, lucidePlus, lucideCheckCircle, lucideHourglass,
      lucideEye, lucideUsers, lucideBriefcase, lucideMapPin,
      lucideClock, lucideHelpCircle, lucideSparkles, lucideTrophy,
      lucidePauseCircle, lucideTrash2, lucideArrowRight, lucideBriefcaseBusiness
    })
  ],
  template: `
    <div class="dashboard-container animate-fade-in-up">

      <!-- Header -->
      <div class="header-section glass-panel">
        <button type="button" routerLink="/community/marketplace" class="back-btn flex items-center justify-center p-2 rounded-full hover:bg-white/50 transition-colors">
          <ng-icon name="lucideArrowLeft" size="20"></ng-icon>
        </button>
        <div class="header-text">
          <h1 class="page-title">Mes Offres Publiées</h1>
          <p class="page-subtitle">Gérez et suivez vos offres d'opportunités.</p>
        </div>
        <button type="button" class="btn-primary-inline create-btn hover-lift flex items-center gap-2" routerLink="/community/marketplace/create">
          <ng-icon name="lucidePlus"></ng-icon> Nouvelle offre
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-grid" *ngIf="opportunities.length > 0">
        <div class="stat-card glass-panel">
          <div class="stat-icon bg-emerald"><ng-icon name="lucideCheckCircle"></ng-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ getOpenCount() }}</div>
            <div class="stat-label">Ouvertes</div>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon bg-orange"><ng-icon name="lucideHourglass"></ng-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ getInProgressCount() }}</div>
            <div class="stat-label">Quiz en cours</div>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon bg-blue"><ng-icon name="lucideEye"></ng-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ getTotalViews() }}</div>
            <div class="stat-label">Vues totales</div>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon bg-purple"><ng-icon name="lucideUsers"></ng-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ getTotalApplications() }}</div>
            <div class="stat-label">Candidatures</div>
          </div>
        </div>
      </div>

      <!-- Offers Grid -->
      <div class="offers-list">
        <div *ngFor="let opp of opportunities; let i = index"
          class="offer-card hover-lift animate-fade-in-up"
          [class.card-in-progress]="opp.status === 'IN_PROGRESS'"
          [class.card-expired]="opp.status === 'EXPIRED'"
          [style.animation-delay.ms]="i * 70">

          <div class="offer-top">
            <div class="offer-header">
              <div class="type-badge" [class]="opp.type.toLowerCase()">{{ opp.type }}</div>
              <div class="status-indicator" [class]="opp.status.toLowerCase().replace('_', '-')">
                <span class="status-dot"></span>
                {{ getStatusLabel(opp.status) }}
              </div>
            </div>
            <h3 class="offer-title">{{ opp.title }}</h3>
            <div class="offer-meta">
              <span class="meta-item"><ng-icon name="lucideBriefcase"></ng-icon> {{ opp.sector }}</span>
              <span class="meta-item"><ng-icon name="lucideMapPin"></ng-icon> {{ opp.location }}</span>
              <span class="meta-item deadline-meta" *ngIf="opp.expiresAt">
                <ng-icon name="lucideClock"></ng-icon> {{ formatDeadline(opp.expiresAt) }}
              </span>
            </div>
          </div>

          <!-- Quiz progress bar (only for IN_PROGRESS) -->
          <div class="quiz-progress" *ngIf="opp.status === 'IN_PROGRESS' && opp.quizSentCount > 0">
            <div class="quiz-progress-header">
              <span class="quiz-label"><ng-icon name="lucideHelpCircle"></ng-icon> Quiz en cours</span>
              <span class="quiz-counter">{{ opp.quizCompletedCount || 0 }} / {{ opp.quizSentCount }} répondu(s)</span>
            </div>
            <div class="quiz-bar-track">
              <div class="quiz-bar-fill"
                [style.width.%]="getQuizProgressPercent(opp)">
              </div>
            </div>
            <span class="quiz-hint">En attente des {{ opp.quizSentCount - (opp.quizCompletedCount || 0) }} candidat(s) restant(s) avant sélection automatique des top 3.</span>
          </div>

          <!-- Expired pipeline triggered info -->
          <div class="pipeline-triggered" *ngIf="opp.status === 'EXPIRED' && opp.quizSentCount === 0">
            <ng-icon name="lucideSparkles"></ng-icon>
            <span>Pipeline IA en cours de traitement.</span>
          </div>

          <div class="offer-stats">
            <div class="mini-stat">
              <ng-icon name="lucideEye"></ng-icon>
              <span>{{ opp.viewsCount }} vues</span>
            </div>
            <div class="mini-stat clickable" (click)="viewApplications(opp.id)">
              <ng-icon name="lucideUsers"></ng-icon>
              <span>{{ opp.applicationsCount }} candidature{{ opp.applicationsCount > 1 ? 's' : '' }}</span>
              <ng-icon class="go-icon" name="lucideArrowRight"></ng-icon>
            </div>
            <div class="mini-stat" *ngIf="opp.finalisedCount > 0">
              <ng-icon name="lucideTrophy"></ng-icon>
              <span>{{ opp.finalisedCount }} sélectionné(s)</span>
            </div>
          </div>

          <div class="offer-actions">
            <button type="button" class="action-btn close-btn flex items-center gap-1.5" (click)="closeOffer(opp.id)"
              *ngIf="opp.status === 'OPEN'">
              <ng-icon name="lucidePauseCircle" size="18"></ng-icon> Clôturer
            </button>
            <button type="button" class="action-btn delete-btn flex items-center gap-1.5" (click)="deleteOffer(opp.id)">
              <ng-icon name="lucideTrash2" size="18"></ng-icon> Supprimer
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="opportunities.length === 0" class="empty-state glass-panel animate-scale-in">
        <div class="empty-icon-wrapper">
          <ng-icon name="lucideBriefcaseBusiness"></ng-icon>
        </div>
        <h3>Aucune offre publiée</h3>
        <p>Commencez à publier des offres pour attirer les meilleurs talents.</p>
        <button type="button" class="btn-primary-inline create-btn-empty flex items-center gap-2 mx-auto" routerLink="/community/marketplace/create">
          <ng-icon name="lucidePlus"></ng-icon> Publier une offre
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 1000px; margin: 40px auto; padding: 0 16px; min-height: 80vh; }

    .header-section {
      display: flex; align-items: center; gap: 16px;
      padding: 24px 28px; border-radius: 20px; margin-bottom: 28px;
      background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #A7F3D0 100%);
      border: none;
    }
    .back-btn { color: var(--text-muted); }
    .header-text { flex: 1; }
    .page-title { margin: 0; font-size: 24px; font-weight: 800; color: var(--text-primary); }
    .page-subtitle { margin: 4px 0 0; color: var(--text-muted); font-size: 14px; }
    .create-btn { border-radius: 20px; padding: 10px 24px; font-weight: 600; }

    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px; margin-bottom: 32px;
    }
    .stat-card {
      background: white; padding: 20px; border-radius: 16px;
      display: flex; align-items: center; gap: 16px;
      border: 1px solid rgba(0,0,0,0.05);
    }
    .stat-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; justify-content: center; align-items: center; color: white;
      flex-shrink: 0;
    }
    .stat-icon ng-icon { font-size: 22px; width: 22px; height: 22px; }
    .bg-emerald { background: #10B981; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
    .bg-orange { background: #f97316; box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3); }
    .bg-blue { background: #3B82F6; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); }
    .bg-purple { background: #8B5CF6; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3); }
    .stat-value { font-size: 22px; font-weight: 800; color: var(--text-primary); }
    .stat-label { color: var(--text-muted); font-size: 12px; font-weight: 500; margin-top: 2px; }

    .offers-list { display: flex; flex-direction: column; gap: 16px; }

    .offer-card {
      background: white; border-radius: 16px; padding: 24px;
      border: 1px solid rgba(0,0,0,0.05); box-shadow: var(--shadow-sm);
      transition: border-color 0.2s;
    }
    .card-in-progress { border-left: 4px solid #f97316; }
    .card-expired { border-left: 4px solid #94a3b8; }

    .offer-top { margin-bottom: 16px; }
    .offer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .type-badge {
      font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .emploi { background: #ECFDF5; color: #059669; }
    .stage { background: #EFF6FF; color: #2563EB; }
    .partenariat { background: #FFF7ED; color: #EA580C; }
    .freelance { background: #FAF5FF; color: #7C3AED; }

    .status-indicator {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 600;
    }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .status-indicator.open { color: #10B981; }
    .status-indicator.open .status-dot { background: #10B981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
    .status-indicator.in-progress { color: #f97316; }
    .status-indicator.in-progress .status-dot { background: #f97316; animation: blink 1.5s infinite; }
    .status-indicator.expired { color: var(--text-muted); }
    .status-indicator.expired .status-dot { background: var(--text-muted); }
    .status-indicator.closed { color: #EF4444; }
    .status-indicator.closed .status-dot { background: #EF4444; }

    @keyframes blink {
      0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
    }

    .offer-title { margin: 0 0 8px; font-size: 18px; font-weight: 700; color: var(--text-primary); }
    .offer-meta { display: flex; gap: 20px; flex-wrap: wrap; }
    .meta-item {
      display: flex; align-items: center; gap: 4px;
      font-size: 13px; color: var(--text-muted); font-weight: 500;
    }
    .meta-item ng-icon { font-size: 16px; width: 16px; height: 16px; color: #94A3B8; }
    .deadline-meta { color: #f97316 !important; font-weight: 600 !important; }
    .deadline-meta ng-icon { color: #f97316 !important; }

    /* Quiz progress */
    .quiz-progress {
      background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px;
      padding: 14px 16px; margin: 12px 0;
    }
    .quiz-progress-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
    }
    .quiz-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 700; color: #c2410c;
    }
    .quiz-label ng-icon { font-size: 16px; width: 16px; height: 16px; }
    .quiz-counter { font-size: 13px; font-weight: 800; color: #c2410c; }
    .quiz-bar-track {
      width: 100%; height: 8px; background: #fde68a; border-radius: 999px; overflow: hidden;
      margin-bottom: 6px;
    }
    .quiz-bar-fill {
      height: 100%; background: linear-gradient(90deg, #f97316, #ea580c);
      border-radius: 999px; transition: width 0.4s ease;
    }
    .quiz-hint { font-size: 11.5px; color: #92400e; }

    /* Pipeline triggered info */
    .pipeline-triggered {
      display: flex; align-items: center; gap: 8px;
      background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px;
      padding: 10px 14px; margin: 12px 0;
      font-size: 13px; font-weight: 600; color: #0369a1;
      animation: fadeIn 0.5s ease;
    }
    .pipeline-triggered ng-icon { font-size: 18px; width: 18px; height: 18px; color: #0ea5e9; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }

    .offer-stats {
      display: flex; gap: 24px; padding: 16px 0;
      margin-bottom: 16px; border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }
    .mini-stat {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: var(--text-muted); font-weight: 600;
    }
    .mini-stat ng-icon { font-size: 18px; width: 18px; height: 18px; color: #4F46E5; }
    .clickable {
      cursor: pointer; padding: 8px 14px; border-radius: 10px;
      transition: all 0.15s;
    }
    .clickable:hover { background: var(--surface-hover); }
    .go-icon { font-size: 14px !important; width: 14px !important; height: 14px !important; margin-left: 4px; }

    .offer-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .action-btn { padding: 8px 16px; border-radius: 12px; font-weight: 600; font-size: 13px; transition: all 0.2s; }
    .close-btn { color: var(--text-muted); background: transparent; border: 1px solid transparent; }
    .close-btn:hover { background: #FFF7ED; color: #EA580C; border-color: #FED7AA; }
    .delete-btn { color: var(--text-muted); background: transparent; border: 1px solid transparent; }
    .delete-btn:hover { background: #FEF2F2; color: #EF4444; border-color: #FECACA; }

    .empty-state {
      text-align: center; padding: 60px 40px; border-radius: 20px; background: white;
    }
    .empty-icon-wrapper {
      width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px;
      background: linear-gradient(135deg, #ECFDF5, #A7F3D0);
      display: flex; justify-content: center; align-items: center;
    }
    .empty-icon-wrapper ng-icon { font-size: 40px; width: 40px; height: 40px; color: #059669; }
    .empty-state h3 { font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px; }
    .empty-state p { color: var(--text-muted); font-size: 14px; margin: 0 0 20px; }
    .create-btn-empty { border-radius: 20px; font-weight: 600; padding: 10px 24px; }
  `]
})
export class PublisherDashboardComponent implements OnInit {

  opportunities: Opportunity[] = [];

  constructor(
    private marketplaceService: MarketplaceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const publisherId = this.authService.getUserId()?.toString() || '';
    this.marketplaceService.getMyOpportunities(publisherId).subscribe(
      opps => this.opportunities = opps
    );
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'OPEN': 'Active',
      'IN_PROGRESS': 'Quiz en cours',
      'EXPIRED': 'Candidatures closes',
      'CLOSED': 'Clôturée'
    };
    return labels[status] || status;
  }

  formatDeadline(expiresAt: string): string {
    if (!expiresAt) return '';
    const deadline = new Date(expiresAt);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);
    if (diffDays < 0) return "Délai dépassé";
    if (diffDays === 0) return "Clôture aujourd'hui";
    if (diffDays === 1) return "Clôture demain";
    return "Clôture dans " + diffDays + "j (" + deadline.toLocaleDateString('fr-FR') + ")";
  }

  getQuizProgressPercent(opp: Opportunity): number {
    if (!opp.quizSentCount || opp.quizSentCount === 0) return 0;
    return Math.round(((opp.quizCompletedCount || 0) / opp.quizSentCount) * 100);
  }

  getOpenCount(): number {
    return this.opportunities.filter(o => o.status === 'OPEN').length;
  }

  getInProgressCount(): number {
    return this.opportunities.filter(o => o.status === 'IN_PROGRESS' || o.status === 'EXPIRED').length;
  }

  getTotalViews(): number {
    return this.opportunities.reduce((sum, o) => sum + (o.viewsCount || 0), 0);
  }

  getTotalApplications(): number {
    return this.opportunities.reduce((sum, o) => sum + (o.applicationsCount || 0), 0);
  }

  closeOffer(id: string) {
    this.marketplaceService.updateStatus(id, 'CLOSED').subscribe({
      next: updated => {
        const index = this.opportunities.findIndex(o => o.id === id);
        if (index !== -1) this.opportunities[index] = updated;
        alert('Offre clôturée avec succès');
      },
      error: () => {
        alert('Erreur lors de la clôture');
      }
    });
  }

  deleteOffer(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      this.marketplaceService.deleteOpportunity(id).subscribe({
        next: () => {
          this.opportunities = this.opportunities.filter(o => o.id !== id);
          alert('Offre supprimée');
        },
        error: () => {
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  viewApplications(opportunityId: string) {
    this.router.navigate(['/community/marketplace/my-offers', opportunityId, 'applications']);
  }
}
