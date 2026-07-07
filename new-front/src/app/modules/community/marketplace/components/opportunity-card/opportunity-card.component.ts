import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Opportunity } from '../../../shared/models/opportunity.model';
import { AuthService } from '../../../../../core/services/auth.service';

import { provideIcons } from '@ng-icons/core';
import { 
  lucideBriefcase, 
  lucideGraduationCap, 
  lucideHandshake, 
  lucideLaptop, 
  lucideMapPin, 
  lucideEye, 
  lucideUsers, 
  lucideSend, 
  lucideLock,
  lucideClock,
  lucideAlertTriangle,
  lucideHelpCircle
} from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-opportunity-card',
  providers: [
    provideIcons({ 
      lucideBriefcase, 
      lucideGraduationCap, 
      lucideHandshake, 
      lucideLaptop, 
      lucideMapPin, 
      lucideEye, 
      lucideUsers, 
      lucideSend, 
      lucideLock,
      lucideClock,
      lucideAlertTriangle,
      lucideHelpCircle
    })
  ],
  template: `
    <div class="premium-card animate-fade-in-up" [style.borderTop]="'4px solid ' + getAccentColor()">
      
      <div class="card-header">
        <div class="type-badge" [class]="opportunity.type.toLowerCase()">
          <ng-icon [name]="getTypeIcon()"></ng-icon>
          <span>{{ opportunity.type }}</span>
        </div>
        <div class="status-indicator" [ngClass]="getStatusClass()">
          <span class="status-dot"></span>
          {{ getStatusLabel() }}
        </div>
      </div>

      <div class="card-content">
        <h3 class="opp-title">{{ opportunity.title }}</h3>

        <div class="meta-row">
          <div class="meta-item">
            <ng-icon name="lucideBriefcase"></ng-icon> <span>{{ opportunity.sector }}</span>
          </div>
          <div class="meta-item">
            <ng-icon name="lucideMapPin"></ng-icon> <span>{{ opportunity.location }}</span>
          </div>
        </div>

        <p class="opp-desc">{{ opportunity.description | slice:0:130 }}{{ opportunity.description.length > 130 ? '...' : '' }}</p>

        <div class="skills" *ngIf="opportunity.skillsRequired.length > 0">
          <span *ngFor="let skill of opportunity.skillsRequired | slice:0:3" class="badge-premium badge-premium-blue">
            {{ skill }}
          </span>
          <span *ngIf="opportunity.skillsRequired.length > 3" class="tag-more">+{{ opportunity.skillsRequired.length - 3 }}</span>
        </div>

        <!-- Deadline badge -->
        <div class="deadline-badge glass-panel" *ngIf="opportunity.expiresAt" [ngClass]="getDeadlineClass()">
          <ng-icon [name]="getDeadlineIcon()"></ng-icon>
          <span>{{ getDeadlineLabel() }}</span>
        </div>
      </div>

      <div class="card-footer">
        <div class="stats">
          <div class="stat-pill" title="Vues">
            <ng-icon name="lucideEye"></ng-icon>
            <span>{{ opportunity.viewsCount }}</span>
          </div>
          <div class="stat-pill" title="Candidatures">
            <ng-icon name="lucideUsers"></ng-icon>
            <span>{{ opportunity.applicationsCount }}</span>
          </div>
        </div>

        <div class="actions">
          <button class="apply-btn"
            [class.disabled]="!canApply()"
            [disabled]="!canApply()"
            *ngIf="!isAdmin() && !isOwnedByCurrentUser() && !hasApplied && !canPublishOpportunities()"
            (click)="onApply($event)">
            <ng-icon [name]="canApply() ? 'lucideSend' : 'lucideLock'"></ng-icon>
            <span>{{ canApply() ? 'Postuler' : getClosedLabel() }}</span>
          </button>

          <button class="details-btn glass-panel" (click)="openDetailsDialog($event)">
            <ng-icon name="lucideEye"></ng-icon>
            <span>Détails</span>
          </button>
        </div>

        <div class="application-state" *ngIf="hasApplied">
          <ng-icon name="lucideCheck" size="16"></ng-icon>
          <span>Déjà postulé</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .premium-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    
    .type-badge {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 12px; border-radius: 20px;
      font-size: 11px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .type-badge.emploi { background: #ECFDF5; color: #059669; }
    .type-badge.stage { background: #EFF6FF; color: #2563EB; }
    .type-badge.partenariat { background: #FFF7ED; color: #EA580C; }
    .type-badge.freelance { background: #FAF5FF; color: #7C3AED; }
    
    .status-indicator { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--co-text-muted); }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #94A3B8; }
    .status-indicator.open { color: #10B981; }
    .status-indicator.open .status-dot { background: #10B981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }

    .card-content { flex: 1; }
    .opp-title {
      margin: 0 0 12px 0; font-size: 19px; font-weight: 800;
      color: var(--co-secondary); line-height: 1.3;
    }
    
    .meta-row { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--co-text-muted); font-weight: 600; }
    .meta-item ng-icon { color: var(--co-primary); opacity: 0.7; }
    
    .opp-desc { color: var(--co-text-main); font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
    
    .skills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
    .tag-more { font-size: 11px; font-weight: 700; color: var(--co-text-muted); }

    .deadline-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 700;
      margin-top: 8px;
    }
    .deadline-badge.urgent { background: rgba(239, 68, 68, 0.05); color: #EF4444; border-color: rgba(239, 68, 68, 0.1); }
    .deadline-badge.normal { background: rgba(16, 185, 129, 0.05); color: #10B981; border-color: rgba(16, 185, 129, 0.1); }
    
    .card-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.04);
      gap: 12px;
    }
    
    .stats { display: flex; gap: 12px; }
    .stat-pill {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 700; color: var(--co-text-muted);
    }
    
    .actions { display: flex; gap: 8px; flex: 1; justify-content: flex-end; }
    
    .apply-btn {
      background: var(--co-primary); color: white; border: none;
      padding: 0 16px; height: 40px; border-radius: 12px;
      font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px;
      transition: all 0.2s ease;
    }
    .apply-btn:hover:not(.disabled) { background: #1541A8; transform: translateY(-2px); }
    .apply-btn.disabled { background: #F1F5F9; color: #94A3B8; cursor: not-allowed; }
    
    .details-btn {
      background: transparent; color: var(--co-primary);
      padding: 0 16px; height: 40px; border-radius: 12px;
      font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px;
      transition: all 0.2s ease;
    }
    .details-btn:hover { background: var(--co-primary-light); }
    
    .application-state {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 12px;
      background: #ECFDF5; color: #059669; font-size: 13px; font-weight: 700;
    }
  `]
})
export class OpportunityCardComponent {
  @Input() opportunity!: Opportunity;
  @Input() currentUserId = '';
  @Input() hasApplied = false;
  @Output() applyClicked = new EventEmitter<string>();
  @Output() detailClicked = new EventEmitter<Opportunity>();

  constructor(
    private authService: AuthService
  ) {}

  openDetailsDialog(event: Event) {
    event.stopPropagation();
    this.detailClicked.emit(this.opportunity);
  }

  onApply(event: Event) {
    event.stopPropagation();
    this.applyClicked.emit(this.opportunity.id);
  }

  canApply(): boolean {
    return this.opportunity.status === 'OPEN';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isOwnedByCurrentUser(): boolean {
    return this.opportunity.publisherId === this.currentUserId;
  }

  canPublishOpportunities(): boolean {
    return this.authService.isAdmin() ||
           this.authService.isEntrepreneur() ||
           this.authService.isPartenaire() ||
           this.authService.isInvestisseur();
  }

  getTypeIcon(): string {
    const icons: Record<string, string> = {
      'EMPLOI': 'lucideBriefcase',
      'STAGE': 'lucideGraduationCap',
      'PARTENARIAT': 'lucideHandshake',
      'FREELANCE': 'lucideLaptop'
    };
    return icons[this.opportunity.type] || 'lucideBriefcase';
  }

  getStatusClass(): string {
    return this.opportunity.status.toLowerCase().replace('_', '_');
  }

  getStatusLabel(): string {
    const labels: Record<string, string> = {
      'OPEN': 'Active',
      'IN_PROGRESS': 'Quiz en cours',
      'EXPIRED': 'Candidatures closes',
      'CLOSED': 'Clôturée'
    };
    return labels[this.opportunity.status] || this.opportunity.status;
  }

  getAccentColor(): string {
    const colors: Record<string, string> = {
      'EMPLOI': '#10B981',
      'STAGE': '#3B82F6',
      'PARTENARIAT': '#F59E0B',
      'FREELANCE': '#8B5CF6'
    };
    return colors[this.opportunity.type] || '#1C4FC3';
  }

  getClosedLabel(): string {
    const labels: Record<string, string> = {
      'IN_PROGRESS': 'Quiz en cours',
      'EXPIRED': 'Clôturée',
      'CLOSED': 'Clôturée'
    };
    return labels[this.opportunity.status] || 'Fermée';
  }

  getDeadlineLabel(): string {
    if (!this.opportunity.expiresAt) return '';
    const now = new Date();
    const deadline = new Date(this.opportunity.expiresAt);
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (this.opportunity.status === 'EXPIRED' || this.opportunity.status === 'CLOSED') {
      return 'Candidatures clôturées';
    }
    if (this.opportunity.status === 'IN_PROGRESS') {
      return 'Quiz envoyés aux finalistes';
    }
    if (diffDays < 0) return 'Délai dépassé';
    if (diffDays === 0) return 'Clôture aujourd\'hui !';
    if (diffDays === 1) return 'Clôture demain';
    if (diffDays <= 3) return `Clôture dans ${diffDays} jours ⚠️`;
    return `Clôture dans ${diffDays} jours`;
  }

  getDeadlineIcon(): string {
    if (!this.opportunity.expiresAt) return 'lucideClock';
    const status = this.opportunity.status;
    if (status === 'EXPIRED' || status === 'CLOSED') return 'lucideLock';
    if (status === 'IN_PROGRESS') return 'lucideHelpCircle';
    const diffDays = Math.ceil((new Date(this.opportunity.expiresAt).getTime() - Date.now()) / 86400000);
    return diffDays <= 3 ? 'lucideAlertTriangle' : 'lucideClock';
  }

  getDeadlineClass(): string {
    if (!this.opportunity.expiresAt) return 'normal';
    const status = this.opportunity.status;
    if (status === 'EXPIRED' || status === 'CLOSED') return 'expired-badge';
    if (status === 'IN_PROGRESS') return 'in-progress-badge';
    const diffDays = Math.ceil((new Date(this.opportunity.expiresAt).getTime() - Date.now()) / 86400000);
    return diffDays <= 3 ? 'urgent' : 'normal';
  }
}
