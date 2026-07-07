import { Component, OnInit } from '@angular/core';
import { MarketplaceService } from '../../services/marketplace.service';
import { Opportunity } from '../../../shared/models/opportunity.model';
import { AuthService } from '../../../../../core/services/auth.service';
import { provideIcons } from '@ng-icons/core';
import { lucideBriefcase, lucidePlus, lucideFileText, lucideSearch, lucideFilter, lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-opportunity-list',
  providers: [
    provideIcons({ lucideBriefcase, lucidePlus, lucideFileText, lucideSearch, lucideFilter, lucideChevronLeft, lucideChevronRight })
  ],
  template: `
    <div class="page-container animate-fade-in">

      <!-- Premium Header -->
      <div class="header-section glass-panel">
        <div class="header-content">
          <h1 class="page-title">Marketplace</h1>
          <p class="page-subtitle">Découvrez des opportunités exclusives et collaborez avec les meilleurs talents.</p>
        </div>
        <div class="header-actions">
          <button class="action-btn secondary hover-lift" routerLink="/community/marketplace/my-applications" *ngIf="!canPublish">
            <ng-icon name="lucideFileText"></ng-icon>
            <span>Mes candidatures</span>
          </button>
          <button class="action-btn secondary hover-lift" routerLink="/community/marketplace/manage" *ngIf="canPublish">
            <ng-icon name="lucideBriefcase"></ng-icon>
            <span>Mes offres</span>
          </button>
          <button class="action-btn primary hover-lift" routerLink="/community/marketplace/create" *ngIf="canPublish">
            <ng-icon name="lucidePlus"></ng-icon>
            <span>Publier une offre</span>
          </button>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="toolbar-section">
        <div class="filter-group">
          <div class="filter-label">
            <ng-icon name="lucideFilter"></ng-icon>
            <span>Filtrer par type</span>
          </div>
          <div class="chips-container">
            <button *ngFor="let type of types"
              class="type-chip"
              [class.active]="selectedType === type.value"
              (click)="filterByType(type.value)">
              {{ type.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Opportunities Grid -->
      <div class="opportunities-section">
        <div *ngIf="loading" class="loading-grid">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6]"></div>
        </div>

        <div class="opportunities-grid" *ngIf="!loading">
          <app-opportunity-card
            *ngFor="let opp of opportunities; let i = index"
            [style.animation-delay.ms]="i * 50"
            [opportunity]="opp"
            [currentUserId]="currentUserId"
            [hasApplied]="hasApplied(opp.id)"
            (applyClicked)="openApplyDialog($event)"
            (detailClicked)="openDetailDialog($event)">
          </app-opportunity-card>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && opportunities.length === 0" class="empty-state glass-panel animate-scale-in">
          <div class="empty-icon">
            <ng-icon name="lucideBriefcase"></ng-icon>
          </div>
          <h3>Aucune opportunité trouvée</h3>
          <p>{{ selectedType ? 'Il n\\'y a pas encore d\\'offres pour ce type.' : 'Le marketplace est vide pour le moment. Revenez plus tard !' }}</p>
        </div>
      </div>

      <!-- Premium Pagination -->
      <div *ngIf="!loading && totalElements > 0" class="pagination-container glass-panel animate-fade-in-up">
        <div class="pagination-info">
          Affichage de <b>{{ currentPage * pageSize + 1 }}</b> à <b>{{ Math.min((currentPage + 1) * pageSize, totalElements) }}</b> sur <b>{{ totalElements }}</b> résultats
        </div>
        <div class="pagination-controls">
          <button class="nav-btn" (click)="onPageChange({pageIndex: currentPage - 1, pageSize: pageSize})" [disabled]="currentPage === 0">
            <ng-icon name="lucideChevronLeft"></ng-icon>
            <span>Précédent</span>
          </button>
          <div class="page-indicator">Page {{ currentPage + 1 }}</div>
          <button class="nav-btn" (click)="onPageChange({pageIndex: currentPage + 1, pageSize: pageSize})" [disabled]="(currentPage + 1) * pageSize >= totalElements">
            <span>Suivant</span>
            <ng-icon name="lucideChevronRight"></ng-icon>
          </button>
        </div>
      </div>

      <!-- Apply Dialog Modal -->
      <app-apply-dialog *ngIf="showApplyDialog"
        [opportunityId]="selectedOpportunityId"
        [opportunityTitle]="selectedOpportunityTitle"
        (closed)="onApplyDialogClosed($event)">
      </app-apply-dialog>

      <!-- Detail Dialog Modal -->
      <app-opportunity-detail-dialog *ngIf="showDetailDialog"
        [data]="selectedOpportunityDetailData"
        (closed)="onDetailDialogClosed($event)">
      </app-opportunity-detail-dialog>

    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 40px auto; padding: 0 16px; }

    .header-section {
      display: flex; justify-content: space-between; align-items: center;
      padding: 32px 40px; border-radius: 24px; margin-bottom: 40px;
      background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
      border: none;
    }
    
    .page-title { margin: 0; font-size: 32px; font-weight: 800; color: #064E3B; letter-spacing: -1px; }
    .page-subtitle { margin: 6px 0 0; color: #065F46; font-size: 15px; font-weight: 500; opacity: 0.8; }

    .header-actions { display: flex; gap: 12px; }
    .action-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 24px; border-radius: 14px;
      font-weight: 700; font-size: 14px;
      transition: all 0.3s ease;
      border: none;
    }
    .action-btn.primary { background: #059669; color: white; box-shadow: 0 10px 20px -10px rgba(5, 150, 105, 0.4); }
    .action-btn.primary:hover { background: #047857; transform: translateY(-2px); }
    .action-btn.secondary { background: white; color: #065F46; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .action-btn.secondary:hover { background: #F0FDF4; transform: translateY(-2px); }

    .toolbar-section { margin-bottom: 40px; }
    .filter-group { display: flex; align-items: center; gap: 24px; }
    .filter-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; flex-shrink: 0; }
    
    .chips-container { display: flex; gap: 10px; overflow-x: auto; padding: 4px 0; }
    .chips-container::-webkit-scrollbar { display: none; }
    
    .type-chip {
      padding: 10px 20px; border-radius: 12px; background: white;
      border: 1px solid rgba(0,0,0,0.05); font-size: 14px; font-weight: 700;
      color: #64748B; cursor: pointer; transition: all 0.2s ease;
      white-space: nowrap;
    }
    .type-chip:hover { border-color: #059669; color: #059669; background: #F0FDF4; }
    .type-chip.active { background: #059669; color: white; border-color: #059669; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2); }

    .opportunities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }

    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
    .skeleton-card { height: 260px; border-radius: 24px; background: linear-gradient(90deg, #F1F5F9 0%, #F8FAFC 50%, #F1F5F9 100%); background-size: 200% 100%; animation: shimmer 2s infinite linear; }
    
    .empty-state {
      text-align: center; padding: 80px 40px; border-radius: 24px;
      display: flex; flex-direction: column; align-items: center;
    }
    .empty-icon {
      width: 80px; height: 80px; border-radius: 24px;
      background: #F0FDF4; color: #059669;
      display: flex; justify-content: center; align-items: center;
      margin-bottom: 24px;
    }
    .empty-icon ng-icon { font-size: 40px; width: 40px; height: 40px; }
    .empty-state h3 { font-size: 22px; font-weight: 800; color: #1E293B; margin-bottom: 8px; }
    .empty-state p { color: #64748B; max-width: 400px; line-height: 1.6; }

    .pagination-container {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 48px; padding: 20px 32px; border-radius: 20px;
    }
    .pagination-info { font-size: 14px; color: #64748B; }
    .pagination-info b { color: #1E293B; }
    
    .pagination-controls { display: flex; align-items: center; gap: 16px; }
    .nav-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px; border-radius: 12px;
      background: #F8FAFC; border: 1px solid #E2E8F0;
      font-size: 13px; font-weight: 700; color: #475569;
      transition: all 0.2s ease;
    }
    .nav-btn:hover:not(:disabled) { background: #F1F5F9; border-color: #CBD5E1; color: #1E293B; }
    .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-indicator { font-size: 14px; font-weight: 800; color: #1E293B; }

    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

    @media (max-width: 992px) {
      .header-section { flex-direction: column; align-items: flex-start; gap: 24px; padding: 32px; }
      .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
      .filter-group { flex-direction: column; align-items: flex-start; gap: 16px; }
    }
  `]
})
export class OpportunityListComponent implements OnInit {
  opportunities: Opportunity[] = [];
  loading = false;
  selectedType = '';
  canPublish = false;
  currentUserId = '';
  appliedOpportunityIds = new Set<string>();
  
  Math = Math; // For use in template

  showApplyDialog = false;
  selectedOpportunityId = '';
  selectedOpportunityTitle = '';

  showDetailDialog = false;
  selectedOpportunityDetailData: any = null;

  types = [
    { value: '', label: 'Tous' },
    { value: 'EMPLOI', label: 'Emplois' },
    { value: 'STAGE', label: 'Stages' },
    { value: 'PARTENARIAT', label: 'Partenariats' },
    { value: 'FREELANCE', label: 'Freelance' }
  ];

  // Pagination
  currentPage = 0;
  pageSize = 6;
  totalElements = 0;

  constructor(
    private marketplaceService: MarketplaceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.canPublish = this.authService.isEntrepreneur() || this.authService.isPartenaire() || this.authService.isAdmin();
    this.currentUserId = this.authService.getUserId()?.toString() || '';
    if (this.currentUserId) {
      this.loadAppliedOpportunityIds();
    }
    this.loadOpportunities();
  }

  loadAppliedOpportunityIds() {
    if (!this.currentUserId) {
      this.appliedOpportunityIds.clear();
      return;
    }

    this.marketplaceService.getMyApplications(this.currentUserId).subscribe({
      next: (applications) => {
        this.appliedOpportunityIds = new Set(applications.map(app => app.opportunityId));
      },
      error: () => {
        this.appliedOpportunityIds.clear();
      }
    });
  }

  hasApplied(opportunityId: string): boolean {
    return this.appliedOpportunityIds.has(opportunityId);
  }

  loadOpportunities() {
    this.loading = true;
    
    if (this.selectedType) {
      // Filter by type with pagination
      this.marketplaceService.getByType(this.selectedType, this.currentPage, this.pageSize).subscribe({
        next: (page) => {
          this.opportunities = page.content;
          this.totalElements = page.totalElements;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      // Load all opportunities with default sorting (OPEN first)
      this.marketplaceService.getAllOpportunities(this.currentPage, this.pageSize).subscribe({
        next: (page) => {
          this.opportunities = page.content;
          this.totalElements = page.totalElements;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  filterByType(type: string) {
    this.selectedType = type;
    this.currentPage = 0;
    this.loadOpportunities();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOpportunities();
  }

  openApplyDialog(opportunityId: string) {
    const opp = this.opportunities.find(o => o.id === opportunityId);
    if (opp) {
      this.selectedOpportunityId = opp.id;
      this.selectedOpportunityTitle = opp.title;
      this.showApplyDialog = true;
    }
  }

  onApplyDialogClosed(applied: boolean) {
    this.showApplyDialog = false;
    if (applied) {
      this.loadAppliedOpportunityIds();
      this.loadOpportunities();
    }
  }

  openDetailDialog(opportunity: Opportunity) {
    this.selectedOpportunityDetailData = {
      opportunity,
      currentUserId: this.currentUserId,
      hasApplied: this.hasApplied(opportunity.id),
      canApply: opportunity.status === 'OPEN'
    };
    this.showDetailDialog = true;
  }

  onDetailDialogClosed(action?: string) {
    this.showDetailDialog = false;
    if (action === 'APPLY') {
      this.openApplyDialog(this.selectedOpportunityDetailData.opportunity.id);
    }
  }
}
