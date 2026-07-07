import { Component, OnInit } from '@angular/core';
import { MarketplaceService } from '../../services/marketplace.service';
import { OpportunityApplication } from '../../../shared/models/opportunity.model';
import { AuthService } from '../../../../../core/services/auth.service';
import { provideIcons } from '@ng-icons/core';
import { 
  lucideArrowLeft, lucideSend, lucideEye, lucideCheckCircle,
  lucideCalendar, lucideUndo, lucideClipboardList, lucideCompass,
  lucideXCircle, lucideInfo
} from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-candidate-dashboard',
  providers: [
    provideIcons({
      lucideArrowLeft, lucideSend, lucideEye, lucideCheckCircle,
      lucideCalendar, lucideUndo, lucideClipboardList, lucideCompass,
      lucideXCircle, lucideInfo
    })
  ],
  template: `
    <div class="dashboard-container animate-fade-in-up">

      <!-- Header -->
      <div class="header-section glass-panel">
        <button type="button" routerLink="/community/marketplace" class="back-btn flex items-center justify-center p-2 rounded-full hover:bg-white/50 transition-colors">
          <ng-icon name="lucideArrowLeft" size="20"></ng-icon>
        </button>
        <div>
          <h1 class="page-title">Mes Candidatures</h1>
          <p class="page-subtitle">Suivez l'avancement de vos candidatures.</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid" *ngIf="applications.length > 0">
        <div class="stat-card glass-panel">
          <div class="stat-icon bg-blue"><ng-icon name="lucideSend"></ng-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ getCountByStatus('SENT') }}</div>
            <div class="stat-label">Envoyées</div>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon bg-purple"><ng-icon name="lucideEye"></ng-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ getCountByStatus('VIEWED') }}</div>
            <div class="stat-label">Consultées</div>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon bg-emerald"><ng-icon name="lucideCheckCircle"></ng-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ getCountByStatus('ACCEPTED') }}</div>
            <div class="stat-label">Acceptées</div>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon bg-amber"><ng-icon name="lucideCalendar"></ng-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ getCountByStatus('INTERVIEW') }}</div>
            <div class="stat-label">Entretiens</div>
          </div>
        </div>
      </div>

      <!-- Applications List -->
      <div class="apps-list">
        <div *ngFor="let app of applications; let i = index"
          class="app-card hover-lift animate-fade-in-up"
          [style.animation-delay.ms]="i * 70">

          <div class="app-top">
            <div class="app-info">
              <div class="app-id">Candidature #{{ app.id | slice:0:8 }}</div>
              <div class="app-date">
                <ng-icon name="lucideCalendar"></ng-icon>
                {{ app.appliedAt | date:'dd MMM yyyy' }}
              </div>
            </div>
            <div class="status-badge" [class]="app.status.toLowerCase()">
              <ng-icon [name]="getStatusIcon(app.status)"></ng-icon>
              {{ getStatusLabel(app.status) }}
            </div>
          </div>

          <!-- Status Timeline -->
          <div class="status-timeline">
            <div class="timeline-step" [class.active]="isStepReached(app.status, 'SENT')">
              <div class="step-dot"></div>
              <span>Envoyée</span>
            </div>
            <div class="timeline-line" [class.filled]="isStepReached(app.status, 'VIEWED')"></div>
            <div class="timeline-step" [class.active]="isStepReached(app.status, 'VIEWED')">
              <div class="step-dot"></div>
              <span>Vue</span>
            </div>
            <div class="timeline-line" [class.filled]="isStepReached(app.status, 'ACCEPTED')"></div>
            <div class="timeline-step" [class.active]="isStepReached(app.status, 'ACCEPTED')">
              <div class="step-dot"></div>
              <span>Acceptée</span>
            </div>
            <div class="timeline-line" [class.filled]="isStepReached(app.status, 'INTERVIEW')"></div>
            <div class="timeline-step" [class.active]="isStepReached(app.status, 'INTERVIEW')">
              <div class="step-dot"></div>
              <span>Entretien</span>
            </div>
          </div>

          <div class="app-cover" *ngIf="app.coverLetter">
            <p>{{ app.coverLetter | slice:0:150 }}{{ app.coverLetter.length > 150 ? '...' : '' }}</p>
          </div>

          <div class="app-actions" *ngIf="app.status === 'SENT' || app.status === 'VIEWED'">
            <button type="button" class="action-btn withdraw-btn flex items-center gap-1.5" (click)="withdraw(app.id)">
              <ng-icon name="lucideUndo"></ng-icon> Retirer la candidature
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="applications.length === 0" class="empty-state glass-panel animate-scale-in">
        <div class="empty-icon-wrapper">
          <ng-icon name="lucideClipboardList"></ng-icon>
        </div>
        <h3>Aucune candidature</h3>
        <p>Explorez le marketplace et postulez à des offres !</p>
        <button type="button" class="btn-primary-inline explore-btn flex items-center gap-2 mx-auto" routerLink="/community/marketplace">
          <ng-icon name="lucideCompass"></ng-icon> Explorer les offres
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 900px; margin: 40px auto; padding: 0 16px; min-height: 80vh; }

    .header-section {
      display: flex; align-items: center; gap: 16px;
      padding: 24px 28px; border-radius: 20px; margin-bottom: 28px;
      background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%);
      border: none;
    }
    .back-btn { color: var(--co-text-muted); }
    .page-title { margin: 0; font-size: 24px; font-weight: 800; color: var(--co-secondary); }
    .page-subtitle { margin: 4px 0 0; color: var(--co-text-muted); font-size: 14px; }

    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px; margin-bottom: 32px;
    }
    .stat-card {
      background: white; padding: 20px; border-radius: 16px;
      display: flex; align-items: center; gap: 16px;
      border: 1px solid rgba(0,0,0,0.05); box-shadow: var(--shadow-sm);
    }
    .stat-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; justify-content: center; align-items: center; color: white;
    }
    .stat-icon ng-icon { font-size: 22px; width: 22px; height: 22px; }
    .bg-blue { background: #3B82F6; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); }
    .bg-purple { background: #8B5CF6; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3); }
    .bg-emerald { background: #10B981; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
    .bg-amber { background: #F59E0B; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3); }
    .stat-value { font-size: 22px; font-weight: 800; color: var(--co-secondary); line-height: 1; }
    .stat-label { color: var(--co-text-muted); font-size: 12px; font-weight: 500; margin-top: 4px; }

    .apps-list { display: flex; flex-direction: column; gap: 16px; }

    .app-card {
      background: white; border-radius: 16px; padding: 24px;
      border: 1px solid rgba(0,0,0,0.05); box-shadow: var(--shadow-sm);
    }

    .app-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .app-id { font-size: 16px; font-weight: 700; color: var(--co-secondary); margin-bottom: 4px; }
    .app-date { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--co-text-muted); }
    .app-date ng-icon { font-size: 14px; width: 14px; height: 14px; }

    .status-badge {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 700; padding: 6px 14px;
      border-radius: 20px; text-transform: uppercase; letter-spacing: 0.3px;
    }
    .status-badge ng-icon { font-size: 16px; width: 16px; height: 16px; }
    .sent { background: #FFF7ED; color: #EA580C; }
    .viewed { background: #EFF6FF; color: #2563EB; }
    .interview { background: #FAF5FF; color: #7C3AED; }
    .accepted { background: #ECFDF5; color: #059669; }
    .rejected { background: #FEF2F2; color: #DC2626; }
    .withdrawn { background: #F8FAFC; color: #64748B; }

    /* Status Timeline */
    .status-timeline {
      display: flex; align-items: center; margin-bottom: 20px;
      padding: 16px 8px; background: #F8FAFC; border-radius: 12px;
    }
    .timeline-step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .step-dot {
      width: 12px; height: 12px; border-radius: 50%;
      background: #E2E8F0; transition: all var(--transition-medium);
    }
    .timeline-step.active .step-dot { background: var(--co-primary); box-shadow: 0 0 8px rgba(79, 70, 229, 0.4); }
    .timeline-step span { font-size: 11px; font-weight: 600; color: #94A3B8; white-space: nowrap; }
    .timeline-step.active span { color: var(--co-primary); }
    .timeline-line { flex: 1; height: 2px; background: #E2E8F0; margin: 0 4px; margin-bottom: 20px; }
    .timeline-line.filled { background: var(--co-primary); }

    .app-cover { color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 16px; }
    .app-cover p { margin: 0; }

    .app-actions { display: flex; justify-content: flex-end; padding-top: 12px; border-top: 1px solid var(--border); }
    .action-btn { padding: 8px 16px; transition: all 0.2s; }
    .withdraw-btn { border-radius: 12px; font-weight: 600; color: var(--text-muted); background: transparent; border: 1px solid transparent; }
    .withdraw-btn:hover { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }

    .empty-state {
      text-align: center; padding: 60px 40px; border-radius: 20px;
      background: white; margin-top: 24px;
    }
    .empty-icon-wrapper {
      width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px;
      background: linear-gradient(135deg, #EEF2FF, #C7D2FE);
      display: flex; justify-content: center; align-items: center;
    }
    .empty-icon-wrapper ng-icon { font-size: 40px; width: 40px; height: 40px; color: #4F46E5; }
    .empty-state h3 { font-size: 20px; font-weight: 700; color: var(--co-secondary); margin: 0 0 8px; }
    .empty-state p { color: var(--co-text-muted); font-size: 14px; margin: 0 0 20px; }
    .explore-btn { border-radius: 20px; font-weight: 600; padding: 0 24px; }
  `]
})
export class CandidateDashboardComponent implements OnInit {

  applications: OpportunityApplication[] = [];
  private statusOrder = ['SENT', 'VIEWED', 'ACCEPTED', 'INTERVIEW'];

  constructor(
    private marketplaceService: MarketplaceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const candidateId = this.authService.getUserId()?.toString() || '';
    this.marketplaceService.getMyApplications(candidateId).subscribe(
      apps => this.applications = apps
    );
  }

  getCountByStatus(status: string): number {
    return this.applications.filter(a => a.status === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'SENT': 'Envoyée', 'VIEWED': 'Consultée', 'INTERVIEW': 'Entretien',
      'ACCEPTED': 'Acceptée', 'REJECTED': 'Refusée', 'WITHDRAWN': 'Retirée'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'SENT': 'lucideSend', 'VIEWED': 'lucideEye', 'INTERVIEW': 'lucideCalendar',
      'ACCEPTED': 'lucideCheckCircle', 'REJECTED': 'lucideXCircle', 'WITHDRAWN': 'lucideUndo'
    };
    return icons[status] || 'lucideInfo';
  }

  isStepReached(currentStatus: string, step: string): boolean {
    const current = this.statusOrder.indexOf(currentStatus);
    const target = this.statusOrder.indexOf(step);
    if (current === -1 || target === -1) return false;
    return current >= target;
  }

  withdraw(applicationId: string) {
    this.marketplaceService.withdrawApplication(applicationId).subscribe({
      next: () => {
        const app = this.applications.find(a => a.id === applicationId);
        if (app) app.status = 'WITHDRAWN';
        alert('Candidature retirée');
      },
      error: () => {
        alert('Erreur lors du retrait');
      }
    });
  }
}