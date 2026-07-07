import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Opportunity } from '../../../shared/models/opportunity.model';

export interface OpportunityDetailData {
  opportunity: Opportunity;
  currentUserId: string;
  hasApplied: boolean;
  canApply: boolean;
}

@Component({
  standalone: false,
  selector: 'app-opportunity-detail-dialog',
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div class="detail-dialog animate-scale-in">
        <!-- Hyper-Premium Aurora Header -->
        <div class="detail-header" [class]="data.opportunity.type.toLowerCase()">
          <div class="header-overlay animate-fade-in-down" style="animation-delay: 0.1s;">
            <div class="header-content">
              <div class="type-tag neon-glow">
                <ng-icon [name]="getTypeIcon()"></ng-icon>
                {{ data.opportunity.type }}
              </div>
              <h2 class="detail-title">{{ data.opportunity.title }}</h2>
              <div class="header-meta">
                <span class="meta-item"><ng-icon name="lucideBriefcase"></ng-icon> {{ data.opportunity.sector }}</span>
                <span class="meta-item"><ng-icon name="lucideMapPin"></ng-icon> {{ data.opportunity.location }}</span>
              </div>
            </div>
          </div>
          <button type="button" class="close-btn flex items-center justify-center p-2 rounded-full" (click)="close()">
            <ng-icon name="lucideX" size="20"></ng-icon>
          </button>
        </div>

      <div class="detail-scroll-content">
        <!-- Main Stats Grid - Staggered -->
        <div class="stats-grid">
          <div class="stat-card animate-fade-in-up" style="animation-delay: 0.3s;">
            <div class="icon-circle"><ng-icon name="lucideUsers"></ng-icon></div>
            <div class="stat-info">
              <label>Postes</label>
              <span>{{ data.opportunity.positionsAvailable }} position{{ data.opportunity.positionsAvailable > 1 ? 's' : '' }}</span>
            </div>
          </div>
          <div class="stat-card animate-fade-in-up" style="animation-delay: 0.4s;">
            <div class="icon-circle"><ng-icon name="lucideCalendar"></ng-icon></div>
            <div class="stat-info">
              <label>Clôture</label>
              <span>{{ data.opportunity.expiresAt | date:'mediumDate' }}</span>
            </div>
          </div>
          <div class="stat-card animate-fade-in-up" style="animation-delay: 0.5s;">
            <div class="icon-circle"><ng-icon name="lucideEye"></ng-icon></div>
            <div class="stat-info">
              <label>Vues</label>
              <span>{{ data.opportunity.viewsCount }} consultations</span>
            </div>
          </div>
        </div>

        <!-- Description Section -->
        <div class="detail-section animate-fade-in-up" style="animation-delay: 0.6s;">
          <h3 class="section-title"><div class="title-dot"></div> Missions & Description</h3>
          <div class="description-text glass-card">
            {{ data.opportunity.description }}
          </div>
        </div>

        <!-- Skills Section -->
        <div class="detail-section animate-fade-in-up" style="animation-delay: 0.7s;" *ngIf="data.opportunity.skillsRequired.length > 0">
          <h3 class="section-title"><div class="title-dot"></div> Compétences clés</h3>
          <div class="skills-container">
            <span *ngFor="let skill of data.opportunity.skillsRequired; let i = index" 
                  class="skill-pill neon-border" 
                  [style.animation-delay]="(0.8 + (i * 0.05)) + 's'">
              {{ skill }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="detail-footer animate-fade-in" style="animation-delay: 1s;">
        <div class="footer-stats">
          <div class="avatar-stack">
            <div class="avatar-mini"></div>
            <div class="avatar-mini"></div>
            <div class="avatar-mini"></div>
          </div>
          <span>{{ data.opportunity.applicationsCount }} talents ont déjà postulé</span>
        </div>
        <div class="footer-actions">
          <button type="button" class="back-btn px-6 py-2" (click)="close()">Retour</button>
          
          <ng-container *ngIf="!isOwnedByCurrentUser() && !data.hasApplied">
            <button type="button" class="apply-main-btn-wow" 
              [disabled]="!data.canApply"
              (click)="onApply()">
              <ng-icon name="lucideRocket"></ng-icon>
              <span>{{ data.canApply ? 'Propulser ma carrière' : 'Clôturé' }}</span>
            </button>
          </ng-container>
          
          <div class="applied-badge-wow" *ngIf="data.hasApplied">
            <ng-icon name="lucideCheckCircle"></ng-icon> Déjà postulé
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    :host { display: block; overflow: hidden; border-radius: 28px; }

    .detail-dialog {
      display: flex;
      flex-direction: column;
      max-height: 92vh;
      width: 100%;
      max-width: 900px;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    /* Premium Shifting Gradient Header */
    .detail-header {
      position: relative;
      padding: 40px 40px 30px;
      color: white;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-size: 200% 200%;
      animation: gradient-shift 8s ease infinite;
    }

    .detail-header.emploi { background-image: linear-gradient(135deg, #065f46 0%, #10b981 50%, #047857 100%); }
    .detail-header.stage { background-image: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1d4ed8 100%); }
    .detail-header.partenariat { background-image: linear-gradient(135deg, #78350f 0%, #f59e0b 50%, #b45309 100%); }
    .detail-header.freelance { background-image: linear-gradient(135deg, #4c1d95 0%, #8b5cf6 50%, #6d28d9 100%); }

    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .header-overlay { position: relative; z-index: 2; width: 100%; display: flex; flex-direction: column; align-items: center; }
    .type-tag {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(12px);
      padding: 8px 20px; border-radius: 30px;
      font-size: 13px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 1px; margin-bottom: 16px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .neon-glow { box-shadow: 0 0 20px rgba(255, 255, 255, 0.2); }

    .detail-title { font-size: 36px; font-weight: 900; margin: 0 0 16px; line-height: 1.1; letter-spacing: -1px; text-shadow: 0 2px 15px rgba(0,0,0,0.3); max-width: 700px; }
    .header-meta { display: flex; gap: 30px; justify-content: center; }
    .meta-item { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.9); }
    .meta-item ng-icon { font-size: 20px; width: 20px; height: 20px; }

    .close-btn { position: absolute; top: 24px; right: 24px; color: white; background: rgba(0,0,0,0.15); backdrop-filter: blur(10px); transition: all 0.3s; }
    .close-btn:hover { background: rgba(255,255,255,0.2); transform: rotate(90deg); }

    /* Content Area */
    .detail-scroll-content {
      padding: 50px;
      overflow-y: auto;
      flex: 1;
      background: #fdfdfd;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 50px;
    }
    .stat-card {
      background: white; padding: 24px; border-radius: 20px;
      display: flex; align-items: center; gap: 16px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03);
      border: 1px solid #f1f5f9;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .stat-card:hover { transform: translateY(-5px); box-shadow: 0 20px 30px -10px rgba(0,0,0,0.08); }
    .icon-circle {
      width: 44px; height: 44px; border-radius: 14px;
      background: var(--co-primary-light); color: var(--co-primary);
      display: flex; justify-content: center; align-items: center;
    }
    .icon-circle ng-icon { font-size: 24px; width: 24px; height: 24px; }
    .stat-info label { display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 800; margin-bottom: 2px; }
    .stat-info span { font-size: 15px; font-weight: 700; color: #1e293b; }

    .detail-section { margin-bottom: 50px; }
    .section-title {
      display: flex; align-items: center; gap: 12px;
      font-size: 20px; font-weight: 800; color: #1e293b;
      margin-bottom: 24px;
    }
    .title-dot { width: 8px; height: 8px; background: var(--co-primary); border-radius: 50%; }

    .description-text {
      font-size: 16px; color: #475569; line-height: 1.8;
      white-space: pre-line; padding: 30px; border-radius: 24px;
    }
    .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }

    .skills-container { display: flex; flex-wrap: wrap; gap: 12px; }
    .skill-pill {
      background: white; color: #334155;
      border: 1px solid #e2e8f0;
      padding: 10px 24px; border-radius: 16px;
      font-size: 14px; font-weight: 700;
      transition: all 0.3s;
      animation: fade-in-up 0.5s both;
    }
    .skill-pill:hover { background: var(--co-primary); color: white; border-color: var(--co-primary); transform: scale(1.05); }
    .neon-border:hover { box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.3); }

    /* Footer */
    .detail-footer {
      padding: 30px 50px;
      background: #ffffff;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }
    .footer-stats { display: flex; align-items: center; gap: 12px; color: #64748b; font-size: 15px; font-weight: 600; }
    .avatar-stack { display: flex; align-items: center; margin-right: 4px; }
    .avatar-mini { width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; border: 2px solid white; margin-right: -10px; }
    .avatar-mini:nth-child(1) { background: #3b82f6; }
    .avatar-mini:nth-child(2) { background: #10b981; }
    .avatar-mini:nth-child(3) { background: #f59e0b; }

    .footer-actions { display: flex; align-items: center; gap: 20px; }
    .back-btn { font-weight: 700; color: #94a3b8; border-radius: 16px; font-size: 15px; }
    
    .apply-main-btn-wow {
      padding: 0 36px; height: 56px; border-radius: 20px;
      font-weight: 800; font-size: 17px;
      background: linear-gradient(135deg, #4f46e5, #3b82f6) !important; color: white !important;
      box-shadow: 0 15px 30px -10px rgba(59, 130, 246, 0.5);
      display: flex; align-items: center; gap: 10px;
      transition: all 0.3s;
      border: none;
    }
    .apply-main-btn-wow:hover:not(:disabled) { transform: translateY(-3px) scale(1.02); box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.6); }
    .apply-main-btn-wow:active { transform: translateY(0); }
    .apply-main-btn-wow:disabled { opacity: 0.5; box-shadow: none; filter: grayscale(1); }
    .apply-main-btn-wow ng-icon { font-size: 22px; width: 22px; height: 22px; }

    .applied-badge-wow {
      display: flex; align-items: center; gap: 8px;
      color: #10b981; font-weight: 800; font-size: 17px;
      background: #ecfdf5; padding: 12px 24px; border-radius: 20px;
    }

    /* Animations */
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-in-down {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .animate-fade-in-down { animation: fade-in-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .animate-fade-in { animation: fade-in 1s ease both; }
    .animate-scale-in { animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; gap: 16px; }
      .detail-header { padding: 30px 24px 24px; }
      .detail-title { font-size: 28px; }
      .header-meta { flex-direction: column; gap: 8px; }
      .detail-scroll-content { padding: 24px; }
      .detail-footer { flex-direction: column; gap: 20px; padding: 24px; }
    }
  `]
})
export class OpportunityDetailDialogComponent {
  @Input() data!: OpportunityDetailData;
  @Output() closed = new EventEmitter<string | undefined>();
  
  constructor() {}

  getTypeIcon(): string {
    const icons: Record<string, string> = {
      'EMPLOI': 'lucideBriefcase',
      'STAGE': 'lucideGraduationCap',
      'PARTENARIAT': 'lucideHandshake',
      'FREELANCE': 'lucideLaptop'
    };
    return icons[this.data.opportunity.type] || 'lucideBriefcase';
  }

  isOwnedByCurrentUser(): boolean {
    return this.data.opportunity.publisherId === this.data.currentUserId;
  }

  onApply() {
    this.closed.emit('APPLY');
  }

  close() {
    this.closed.emit();
  }
}
