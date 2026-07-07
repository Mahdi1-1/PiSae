import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { Opportunity, OpportunityApplication } from '../../../shared/models/opportunity.model';
import { provideIcons } from '@ng-icons/core';
import { 
  lucidePlus, lucideBriefcaseBusiness, lucideBriefcase, lucideMapPin,
  lucideClock, lucideEye, lucideUsers, lucideList, lucideEdit,
  lucideStar, lucideTrash2, lucideLoader2
} from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-manage-opportunities',
  providers: [
    provideIcons({
      lucidePlus, lucideBriefcaseBusiness, lucideBriefcase, lucideMapPin,
      lucideClock, lucideEye, lucideUsers, lucideList, lucideEdit,
      lucideStar, lucideTrash2, lucideLoader2
    })
  ],
  template: `
    <div class="manage-container animate-fade-in-up">
      
      <!-- Header -->
      <div class="header-section glass-panel">
        <div>
          <h1 class="page-title">Mes offres d'emploi</h1>
          <p class="page-subtitle">Gérez vos opportunités et consultez les candidatures</p>
        </div>
        <div class="header-actions">
          <button type="button" 
            class="btn-primary-inline create-btn hover-lift flex items-center gap-2"
            routerLink="/community/marketplace/create">
            <ng-icon name="lucidePlus"></ng-icon>
            Créer une offre
          </button>
        </div>
      </div>

      <!-- Opportunities List -->
      <div class="opportunities-section">
        <div *ngIf="loading" class="loading-state flex flex-col items-center justify-center p-12">
          <ng-icon name="lucideLoader2" class="animate-spin text-4xl text-blue-600 mb-4"></ng-icon>
          <p>Chargement de vos offres...</p>
        </div>

        <div *ngIf="!loading && opportunities.length === 0" class="empty-state">
          <ng-icon name="lucideBriefcaseBusiness"></ng-icon>
          <h3>Aucune offre publiée</h3>
          <p>Commencez par créer votre première opportunité d'emploi</p>
          <button type="button" 
            class="btn-primary-inline create-btn hover-lift flex items-center gap-2 mx-auto"
            routerLink="/community/marketplace/create">
            <ng-icon name="lucidePlus"></ng-icon>
            Créer une offre
          </button>
        </div>

        <div *ngIf="!loading && opportunities.length > 0" class="opportunities-grid">
          <div *ngFor="let opp of opportunities; let i = index"
            class="opportunity-card hover-lift animate-fade-in-up"
            [style.animation-delay.ms]="i * 100">

            <!-- Status Badge -->
            <div class="status-badge" [class]="opp.status.toLowerCase()">
              {{ getStatusText(opp.status) }}
            </div>

            <!-- Content -->
            <div class="card-content">
              <h3 class="opportunity-title">{{ opp.title }}</h3>
              <p class="opportunity-description">{{ opp.description }}</p>
              
              <div class="opportunity-meta">
                <span class="meta-item">
                  <ng-icon name="lucideBriefcase"></ng-icon>
                  {{ opp.type }}
                </span>
                <span class="meta-item">
                  <ng-icon name="lucideMapPin"></ng-icon>
                  {{ opp.location }}
                </span>
                <span class="meta-item">
                  <ng-icon name="lucideClock"></ng-icon>
                  {{ opp.createdAt | date:'dd MMM yyyy' }}
                </span>
              </div>

              <!-- Skills -->
              <div class="skills-section" *ngIf="opp?.skillsRequired && opp.skillsRequired.length > 0">
                <span *ngFor="let skill of opp.skillsRequired.slice(0, 4)" class="skill-chip flex items-center justify-center px-3 rounded-full text-blue-700">
                  {{ skill }}
                </span>
                <span *ngIf="opp.skillsRequired.length > 4" class="more-skills">+{{ opp.skillsRequired.length - 4 }}</span>
              </div>
            </div>

            <!-- Stats -->
            <div class="stats-section">
              <div class="stat-item">
                <ng-icon name="lucideEye"></ng-icon>
                <span>{{ opp.viewsCount || 0 }} vues</span>
              </div>
              <div class="stat-item">
                <ng-icon name="lucideUsers"></ng-icon>
                <span>{{ opp.applicationsCount || 0 }} candidatures</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="actions-section">
              <button type="button" 
                class="action-btn view-applications-btn flex items-center gap-1.5"
                (click)="viewApplications(opp.id)">
                <ng-icon name="lucideList"></ng-icon>
                Voir candidatures
              </button>
              <button type="button" 
                class="action-btn edit-btn flex items-center gap-1.5"
                (click)="editOpportunity(opp.id)">
                <ng-icon name="lucideEdit"></ng-icon>
                Modifier
              </button>
              <span class="top-candidates-badge flex items-center gap-1.5" *ngIf="opp.applicationsCount > 0">
                <ng-icon name="lucideStar"></ng-icon>
                Top 3 candidats
              </span>
              <button type="button" 
                class="action-btn delete-btn flex items-center gap-1.5"
                (click)="deleteOpportunity(opp)">
                <ng-icon name="lucideTrash2"></ng-icon>
                Supprimer
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .manage-container { max-width: 1200px; margin: 40px auto; padding: 0 16px; }
    
    .header-section {
      display: flex; align-items: center; justify-content: space-between;
      background: white; border-radius: 20px; padding: 24px;
      border: 1px solid rgba(0,0,0,0.05); margin-bottom: 32px;
    }
    
    .page-title { font-size: 24px; font-weight: 700; color: var(--co-secondary); margin: 0; }
    .page-subtitle { color: var(--co-text-muted); margin: 4px 0 0; }
    
    .header-actions {
      display: flex; gap: 12px;
    }
    
    .create-btn {
      border-radius: 16px; font-weight: 600;
      transition: var(--transition-fast);
    }

    .opportunities-section { min-height: 400px; }
    
    .loading-state {
      text-align: center; padding: 60px; color: var(--co-text-muted);
    }
    
    .empty-state {
      text-align: center; padding: 80px 40px;
      background: white; border-radius: 20px; border: 1px solid rgba(0,0,0,0.05);
    }
    
    .empty-state ng-icon {
      font-size: 64px; width: 64px; height: 64px;
      color: #CBD5E1; margin-bottom: 16px;
    }
    
    .empty-state h3 {
      font-size: 20px; font-weight: 700; color: var(--co-secondary); margin: 0 0 16px 0;
    }
    
    .empty-state p {
      color: var(--co-text-muted); margin: 0 0 24px 0; }
    
    .opportunities-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }
    
    .opportunity-card {
      background: white; border-radius: 20px; padding: 24px;
      border: 1px solid rgba(0,0,0,0.05); transition: var(--transition-fast);
      position: relative;
    }
    
    .status-badge {
      position: absolute; top: -10px; right: -10px;
      padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-badge.open { background: var(--co-success); color: white; }
    .status-badge.closed { background: var(--co-text-muted); color: white; }
    .status-badge.draft { background: var(--co-warning); color: white; }
    
    .card-content {
      margin-top: 20px;
    }
    
    .opportunity-title {
      font-size: 18px; font-weight: 700; color: var(--co-secondary);
      margin: 0 0 12px 0; line-height: 1.4;
    }
    
    .opportunity-description {
      color: var(--co-text-main); font-size: 14px; line-height: 1.5;
      margin: 0 0 16px 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .opportunity-meta {
      display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0;
    }
    
    .meta-item {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--co-text-muted);
      background: var(--co-background); padding: 4px 8px; border-radius: 8px;
    }
    
    .skills-section {
      margin: 16px 0; display: flex; flex-wrap: wrap; gap: 6px;
    }
    
    .skill-chip {
      font-size: 11px; height: 24px; background: var(--co-primary-light);
    }
    
    .more-skills {
      font-size: 11px; color: var(--co-text-muted); font-weight: 600;
    }
    
    .stats-section {
      display: flex; gap: 16px; margin: 16px 0;
      padding-top: 16px; border-top: 1px solid var(--co-background);
    }
    
    .stat-item {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--co-text-muted);
    }
    
    .actions-section {
      display: flex; gap: 8px; margin-top: 16px;
    }
    
    .action-btn {
      border-radius: 12px; font-weight: 500; font-size: 13px;
      padding: 0 16px; height: 36px;
    }
    
    .view-applications-btn { background: var(--co-primary); color: white; }
    .edit-btn { background: var(--co-warning); color: white; }
    
    .top-candidates-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: white;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .top-candidates-badge ng-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .delete-btn { border: 1px solid var(--co-danger); color: var(--co-danger); }
    
    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    @media (max-width: 768px) {
      .opportunities-grid { grid-template-columns: 1fr; }
      .header-section { flex-direction: column; gap: 16px; }
      .actions-section { flex-wrap: wrap; }
    }
  `]
})
export class ManageOpportunitiesComponent implements OnInit {

  opportunities: Opportunity[] = [];
  loading = false;
  currentUserId = '';

  // Pagination
  currentPage = 0;
  pageSize = 5;
  totalElements = 0;

  constructor(
    private router: Router,
    private marketplaceService: MarketplaceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId()?.toString() || '';
    this.loadMyOpportunities();
  }

  loadMyOpportunities() {
    this.loading = true;
    this.marketplaceService.getMyOpportunities(this.currentUserId).subscribe({
      next: (opportunities) => {
        this.opportunities = opportunities;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors du chargement de vos offres');
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMyOpportunities();
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'OPEN': return 'Ouverte';
      case 'IN_PROGRESS': return 'En Cours';
      case 'EXPIRED': return 'Expirée';
      case 'CLOSED': return 'Fermée';
      case 'DRAFT': return 'Brouillon';
      default: return status;
    }
  }

  deleteOpportunity(opportunity: Opportunity) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'offre "${opportunity.title}" ?`)) {
      this.marketplaceService.deleteOpportunity(opportunity.id).subscribe({
        next: () => {
          alert('Offre supprimée avec succès');
          this.loadMyOpportunities();
        },
        error: () => {
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  viewApplications(opportunityId: string) {
    this.router.navigate(['/community/marketplace', opportunityId, 'applications']);
  }

  editOpportunity(opportunityId: string) {
    this.router.navigate(['/community/marketplace', opportunityId, 'edit']);
  }

  viewRecommendations(opportunityId: string) {
    this.router.navigate(['/community/marketplace', opportunityId, 'recommendations']);
  }
}
