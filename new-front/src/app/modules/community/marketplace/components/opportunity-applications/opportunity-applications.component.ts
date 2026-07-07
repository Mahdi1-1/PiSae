import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MarketplaceService } from '../../services/marketplace.service';
import { OpportunityApplication, Opportunity } from '../../../shared/models/opportunity.model';
import { UserProfileService } from '../../../../../core/services/user-profile.service';
import { absoluteGatewayUrl } from '../../../../../core/utils/absolute-url';
import { provideIcons } from '@ng-icons/core';
import { 
  lucideArrowLeft, lucideUsers, lucideBriefcase, lucideHelpCircle,
  lucideVerified, lucideLoader2, lucideStar, lucidePersonStanding,
  lucideFileText, lucideClock, lucideMessageCircle, lucideList,
  lucideClipboardList, lucideThumbsUp
} from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-opportunity-applications',
  providers: [
    provideIcons({
      lucideArrowLeft, lucideUsers, lucideBriefcase, lucideHelpCircle,
      lucideVerified, lucideLoader2, lucideStar, lucidePersonStanding,
      lucideFileText, lucideClock, lucideMessageCircle, lucideList,
      lucideClipboardList, lucideThumbsUp
    })
  ],
  template: `
    <div class="applications-container animate-fade-in-up">
      
      <!-- Header -->
      <div class="header-section glass-panel">
        <div class="header-content">
          <button type="button" class="back-btn flex items-center justify-center p-2 rounded-full hover:bg-white/50 transition-colors" routerLink="/community/marketplace/manage">
            <ng-icon name="lucideArrowLeft" size="20"></ng-icon>
          </button>
          <div>
            <h1 class="page-title">Candidatures</h1>
            <p class="page-subtitle">{{ opportunity?.title || 'Chargement...' }}</p>
          </div>
        </div>
        <div class="header-stats">
          <div class="stat-card">
            <ng-icon name="lucideUsers"></ng-icon>
            <span>{{ applications.length }} candidatures</span>
          </div>
          <div class="stat-card" *ngIf="opportunity">
            <ng-icon name="lucideBriefcase"></ng-icon>
            <span>{{ opportunity.positionsAvailable }} poste(s)</span>
          </div>
          <div class="stat-card quiz-sent" *ngIf="opportunity && opportunity.quizSentCount">
            <ng-icon name="lucideHelpCircle"></ng-icon>
            <span>{{ opportunity.quizSentCount }} quiz envoyés</span>
          </div>
          <div class="stat-card finalised" *ngIf="opportunity && opportunity.finalisedCount">
            <ng-icon name="lucideVerified"></ng-icon>
            <span>{{ opportunity.finalisedCount }} finalisés</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state flex flex-col items-center justify-center p-12">
        <ng-icon name="lucideLoader2" class="animate-spin text-4xl text-blue-600 mb-4"></ng-icon>
        <p>Chargement des candidatures...</p>
      </div>

      <!-- Content -->
      <div *ngIf="!loading" class="content-section">
        
        <!-- Top Candidates Section -->
        <div class="top-candidates-section" *ngIf="topCandidates.length > 0">
          <h2 class="section-title">
            <ng-icon name="lucideThumbsUp"></ng-icon>
            Top Candidats IA ({{ topCandidates.length }})
          </h2>
          <div class="candidates-grid">
            <div *ngFor="let app of topCandidates; let i = index"
              class="candidate-card recommended hover-lift animate-fade-in-up"
              [style.animation-delay.ms]="i * 100">
              
              <div class="candidate-header">
                <div class="candidate-info">
                  <div *ngIf="i < 3" class="top-badge" [class]="'rank-' + (i + 1)">
                    <ng-icon name="lucideStar"></ng-icon>
                    Top {{ i + 1 }}
                  </div>
                  <div class="candidate-avatar">
                    <ng-icon name="lucidePersonStanding"></ng-icon>
                  </div>
                  <div>
                    <h3>{{ getCandidateName(app.candidateId) }}</h3>
                    <p class="candidate-id">ID: {{ app.candidateId }}</p>
                  </div>
                </div>
                <div class="recommendation-score">
                  <ng-icon name="lucideStar"></ng-icon>
                  <span>{{ getRecommendationScore(app) }}%</span>
                </div>
              </div>

              <div class="application-content">
                <div class="cover-letter">
                  <h4>Lettre de motivation</h4>
                  <p>{{ app.coverLetter }}</p>
                </div>
                
                <div class="cv-section" *ngIf="app.cvUrl">
                  <h4>CV</h4>
                  <button type="button" class="cv-link flex items-center gap-1" (click)="downloadCv(app.cvUrl)">
                    <ng-icon name="lucideFileText"></ng-icon>
                    Voir le CV
                  </button>
                </div>

                <div class="quiz-score-section" *ngIf="app.quizScore !== undefined">
                  <h4>Score du Quiz</h4>
                  <div class="score-badge" [class]="app.quizScore >= 70 ? 'high' : (app.quizScore >= 40 ? 'medium' : 'low')">
                    <ng-icon name="lucideHelpCircle"></ng-icon>
                    <span>{{ app.quizScore | number:'1.0-1' }}%</span>
                  </div>
                </div>
              </div>

              <div class="application-meta">
                <span class="date">
                  <ng-icon name="lucideClock"></ng-icon>
                  {{ app.appliedAt | date:'dd MMM yyyy HH:mm' }}
                </span>
                <span class="status" [class]="app.status.toLowerCase()">
                  {{ getStatusText(app.status) }}
                </span>
              </div>

              <div class="candidate-actions">
                <button type="button" 
                  class="btn-primary-inline action-btn flex items-center gap-1.5"
                  (click)="sendMessage(app.candidateId)">
                  <ng-icon name="lucideMessageCircle"></ng-icon>
                  Contacter
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- All Applications Section -->
        <div class="all-applications-section">
          <h2 class="section-title">
            <ng-icon name="lucideList"></ng-icon>
            Toutes les candidatures ({{ applications.length }})
          </h2>
          
          <div *ngIf="applications.length === 0" class="empty-state">
            <ng-icon name="lucideClipboardList"></ng-icon>
            <h3>Aucune candidature</h3>
            <p>Cette offre n'a pas encore reçu de candidatures</p>
          </div>

          <div *ngIf="applications.length > 0" class="applications-list">
            <div *ngFor="let app of applications; let i = index"
              class="application-card hover-lift animate-fade-in-up"
              [style.animation-delay.ms]="i * 100">
              
              <div class="application-header">
                <div class="candidate-info">
                  <div class="candidate-avatar">
                    <ng-icon name="lucidePersonStanding"></ng-icon>
                  </div>
                  <div>
                    <h3>{{ getCandidateName(app.candidateId) }}</h3>
                    <p class="candidate-id">ID: {{ app.candidateId }}</p>
                  </div>
                </div>
                <div class="application-status">
                  <span class="status-badge" [class]="app.status.toLowerCase()">
                    {{ getStatusText(app.status) }}
                  </span>
                </div>
              </div>

              <div class="application-content">
                <div class="cover-letter">
                  <h4>Lettre de motivation</h4>
                  <p>{{ app.coverLetter }}</p>
                </div>
                
                <div class="cv-section" *ngIf="app.cvUrl">
                  <h4>CV</h4>
                  <button type="button" class="cv-link flex items-center gap-1" (click)="downloadCv(app.cvUrl)">
                    <ng-icon name="lucideFileText"></ng-icon>
                    Voir le CV
                  </button>
                </div>

                <div class="quiz-score-section" *ngIf="app.quizScore !== undefined">
                  <h4>Score du Quiz</h4>
                  <div class="score-badge" [class]="app.quizScore >= 70 ? 'high' : (app.quizScore >= 40 ? 'medium' : 'low')">
                    <ng-icon name="lucideHelpCircle"></ng-icon>
                    <span>{{ app.quizScore | number:'1.0-1' }}%</span>
                  </div>
                </div>
              </div>

              <div class="application-meta">
                <span class="date">
                  <ng-icon name="lucideClock"></ng-icon>
                  {{ app.appliedAt | date:'dd MMM yyyy HH:mm' }}
                </span>
              </div>

              <div class="application-actions">
                <button type="button" 
                  class="btn-primary-inline action-btn flex items-center gap-1.5"
                  (click)="sendMessage(app.candidateId)">
                  <ng-icon name="lucideMessageCircle"></ng-icon>
                  Contacter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .applications-container { max-width: 1200px; margin: 40px auto; padding: 0 16px; }
    
    .header-section {
      display: flex; align-items: center; justify-content: space-between;
      background: white; border-radius: 20px; padding: 24px;
      border: 1px solid rgba(0,0,0,0.05); margin-bottom: 32px;
      flex-wrap: wrap; gap: 16px;
    }
    
    .header-content {
      display: flex; align-items: center; gap: 16px;
    }
    
    .back-btn { color: var(--co-text-muted); }
    
    .page-title { font-size: 24px; font-weight: 700; color: var(--co-secondary); margin: 0; }
    .page-subtitle { color: var(--co-text-muted); margin: 4px 0 0; }
    
    .header-stats {
      display: flex; gap: 12px; flex-wrap: wrap;
    }
    
    .stat-card {
      display: flex; align-items: center; gap: 8px;
      background: var(--co-background); padding: 8px 16px;
      border-radius: 12px; font-size: 14px;
    }
    
    .stat-card.quiz-sent { background: #dbeafe; color: #1e40af; }
    .stat-card.finalised { background: #dcfce7; color: #166534; }
    
    .send-quiz-btn {
      border-radius: 12px; font-weight: 600;
      background: linear-gradient(135deg, var(--co-primary) 0%, #7c3aed 100%);
      color: white;
    }
    
    .top-badge {
      display: flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;
    }
    
    .top-badge.rank-1 { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; }
    .top-badge.rank-2 { background: linear-gradient(135deg, #9ca3af, #6b7280); color: white; }
    .top-badge.rank-3 { background: linear-gradient(135deg, #d97706, #b45309); color: white; }
    
    .top-badge ng-icon { font-size: 14px; width: 14px; height: 14px; }
    
    .loading-state {
      text-align: center; padding: 60px; color: var(--co-text-muted);
    }
    
    .section-title {
      display: flex; align-items: center; gap: 12px;
      font-size: 20px; font-weight: 700; color: var(--co-secondary);
      margin: 32px 0 24px 0;
    }
    
    .candidates-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px; margin-bottom: 32px;
    }
    
    .candidate-card, .application-card {
      background: white; border-radius: 20px; padding: 24px;
      border: 1px solid rgba(0,0,0,0.05); transition: var(--transition-fast);
    }
    
    .candidate-card.recommended {
      border: 2px solid var(--co-primary); background: linear-gradient(135deg, #f8faff 0%, white 100%);
    }
    
    .candidate-header, .application-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
    }
    
    .candidate-info {
      display: flex; align-items: center; gap: 12px;
    }
    
    .candidate-avatar {
      width: 48px; height: 48px; border-radius: 50%;
      background: var(--co-primary-light); color: var(--co-primary);
      display: flex; justify-content: center; align-items: center;
    }
    
    .candidate-info h3 {
      font-size: 16px; font-weight: 700; color: var(--co-secondary); margin: 0;
    }
    
    .candidate-id {
      font-size: 12px; color: var(--co-text-muted); margin: 2px 0 0;
    }
    
    .recommendation-score {
      display: flex; align-items: center; gap: 6px;
      background: var(--co-primary); color: white;
      padding: 6px 12px; border-radius: 20px; font-weight: 600;
    }
    
    .application-content {
      margin-bottom: 20px;
    }
    
    .cover-letter h4 {
      font-size: 14px; font-weight: 600; color: var(--co-secondary); margin: 0 0 8px 0;
    }
    
    .cover-letter p {
      color: var(--co-text-main); font-size: 14px; line-height: 1.5;
      margin: 0 0 16px 0; max-height: 100px; overflow-y: auto;
    }
    
    .cv-section h4 {
      font-size: 14px; font-weight: 600; color: var(--co-secondary); margin: 0 0 8px 0;
    }
    
    .cv-link {
      display: inline-flex; align-items: center; gap: 8px;
      color: var(--co-primary); text-decoration: none;
      font-weight: 500; transition: var(--transition-fast);
    }
    
    .cv-link:hover {
      color: var(--co-primary-dark);
    }
    
    .quiz-score-section {
      margin-top: 16px; padding-top: 16px; border-top: 1px dashed rgba(0,0,0,0.1);
    }
    
    .quiz-score-section h4 {
      font-size: 14px; font-weight: 600; color: var(--co-secondary); margin: 0 0 8px 0;
    }
    
    .score-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;
    }
    
    .score-badge ng-icon { font-size: 18px; width: 18px; height: 18px; }
    
    .score-badge.high { background: #dcfce7; color: #166534; }
    .score-badge.medium { background: #fef9c3; color: #854d0e; }
    .score-badge.low { background: #fee2e2; color: #991b1b; }
    
    .application-meta {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 0; border-top: 1px solid var(--co-background);
      margin-bottom: 16px;
    }
    
    .date {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--co-text-muted);
    }
    
    .status-badge {
      padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-badge.pending { background: var(--co-warning); color: white; }
    .status-badge.accepted { background: var(--co-success); color: white; }
    .status-badge.rejected { background: var(--co-danger); color: white; }
    
    .candidate-actions, .application-actions {
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    
    .action-btn {
      border-radius: 12px; font-weight: 500; transition: var(--transition-fast);
    }
    
    .action-btn:disabled {
      opacity: 0.5; cursor: not-allowed;
    }
    
    .empty-state {
      text-align: center; padding: 60px; color: var(--co-text-muted);
      background: white; border-radius: 20px; border: 1px solid rgba(0,0,0,0.05);
    }
    
    .empty-state ng-icon {
      font-size: 48px; width: 48px; height: 48px;
      color: #CBD5E1; margin-bottom: 16px;
    }
    
    .empty-state h3 {
      font-size: 18px; font-weight: 700; margin: 0 0 8px 0;
    }
    
    @media (max-width: 768px) {
      .candidates-grid { grid-template-columns: 1fr; }
      .header-section { flex-direction: column; gap: 16px; }
      .candidate-actions, .application-actions { flex-direction: column; }
    }
  `]
})
export class OpportunityApplicationsComponent implements OnInit {

  opportunity: Opportunity | null = null;
  applications: OpportunityApplication[] = [];
  topCandidates: OpportunityApplication[] = [];
  loading = false;
  opportunityId = '';
  private candidateNameMap = new Map<string, string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marketplaceService: MarketplaceService,
    private userProfileService: UserProfileService
  ) {}

  cvHref(url: string | undefined): string {
    return absoluteGatewayUrl(url);
  }

  downloadCv(cvUrl: string | undefined) {
    if (!cvUrl) {
      return;
    }

    const fileName = cvUrl.split('/').pop() || 'cv.pdf';
    this.marketplaceService.downloadCv(fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      },
      error: (err) => {
        console.error('Error downloading CV:', err);
        alert('Erreur lors du téléchargement du CV');
      }
    });
  }

  ngOnInit() {
    this.opportunityId = this.route.snapshot.paramMap.get('opportunityId') || '';
    this.loadOpportunityData();
  }

  loadOpportunityData() {
    this.loading = true;
    
    // Load opportunity details
    this.marketplaceService.getAllOpportunities(0, 100).subscribe({
      next: (page) => {
        const opportunity = page.content.find(opp => opp.id === this.opportunityId);
        this.opportunity = opportunity || null;
        
        if (!opportunity) {
          alert('Opportunité non trouvée');
          this.router.navigate(['/community/marketplace/manage']);
          return;
        }
      },
      error: () => {
        alert('Erreur lors du chargement de l\'opportunité');
      }
    });
    
    // Load applications
    this.marketplaceService.getApplicationsForOpportunity(this.opportunityId).subscribe({
      next: applications => {
        this.applications = applications;
        this.hydrateCandidateNames(applications);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors du chargement des candidatures');
      }
    });

    // Load top candidates
    this.marketplaceService.getTopCandidates(this.opportunityId).subscribe({
      next: candidates => {
        this.topCandidates = candidates.sort((a, b) => this.getRecommendationScore(b) - this.getRecommendationScore(a));
        this.hydrateCandidateNames(this.topCandidates);
      },
      error: () => {
        console.error('Erreur lors du chargement des candidats recommandés');
      }
    });
  }

  private hydrateCandidateNames(apps: OpportunityApplication[]) {
    const ids = [...new Set(apps.map(a => a.candidateId).filter(Boolean))];
    if (ids.length === 0) {
      return;
    }
    forkJoin(ids.map(id => this.userProfileService.getDisplayName(id))).subscribe({
      next: names => ids.forEach((id, i) => this.candidateNameMap.set(id, names[i]))
    });
  }

  getCandidateName(candidateId: string): string {
    return this.candidateNameMap.get(candidateId) || `Candidat ${candidateId}`;
  }

  getRecommendationScore(application: OpportunityApplication): number {
    if (application.cvScore !== undefined && application.coverLetterScore !== undefined) {
      // Reconstruct the weighted score used by the backend
      // CV (Skills + Semantic + Experience) = 90%, Cover Letter = 10%
      const totalScore = (application.cvScore * 0.9 + application.coverLetterScore * 0.1) * 100;
      return Math.round(totalScore);
    }
    
    // Fallback if scores are not yet calculated
    return 0;
  }

  getRecommendedQuizCount(): number {
    if (!this.opportunity) return 5;
    return this.opportunity.positionsAvailable * 3;
  }

  sendQuizToTop() {
    const count = this.getRecommendedQuizCount();
    this.marketplaceService.sendQuizToTopCandidates(this.opportunityId, count).subscribe({
      next: (results) => {
        alert(`${results.length} quiz envoyés aux meilleurs candidats !`);
        this.loadOpportunityData();
      },
      error: (err) => {
        alert('Erreur lors de l\'envoi des quiz');
      }
    });
  }

  finaliseApplication(applicationId: string) {
    this.marketplaceService.finaliseApplication(applicationId).subscribe({
      next: () => {
        alert('Candidature finalisée avec succès !');
        this.loadOpportunityData();
      },
      error: (err) => {
        alert('Erreur lors de la finalisation');
      }
    });
  }

  updateApplicationStatus(applicationId: string, status: string) {
    this.marketplaceService.updateApplicationStatus(applicationId, status).subscribe({
      next: (res) => {
        alert(`Candidature ${status === 'ACCEPTED' ? 'acceptée' : 'refusée'} avec succès`);
        this.loadOpportunityData();
      },
      error: (err) => {
        alert('Erreur lors de la mise à jour');
      }
    });
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'SENT': return 'Envoyée';
      case 'VIEWED': return 'Consultée';
      case 'INTERVIEW': return 'Entretien';
      case 'PENDING': return 'En attente';
      case 'ACCEPTED': return 'Accepté';
      case 'REJECTED': return 'Refusé';
      case 'WITHDRAWN': return 'Retirée';
      default: return status;
    }
  }

  sendMessage(candidateId: string) {
    this.router.navigate(['/community/messaging/private', candidateId]);
  }
}
