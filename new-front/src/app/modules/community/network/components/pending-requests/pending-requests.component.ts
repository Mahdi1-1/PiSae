import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ConnectionService } from '../../services/connection.service';
import { MemberConnection } from '../../../shared/models/connection.model';
import { AuthService } from '../../../../../core/services/auth.service';
import { UserProfileService, UserPublic } from '../../../../../core/services/user-profile.service';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideInbox, lucideSend, lucideUserPlus, lucideUser, lucideCheckCircle, lucideXCircle, lucideTrash2, lucideClock, lucideQuote, lucideCheckCheck } from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-pending-requests',
  providers: [
    provideIcons({ lucideChevronLeft, lucideInbox, lucideSend, lucideUserPlus, lucideUser, lucideCheckCircle, lucideXCircle, lucideTrash2, lucideClock, lucideQuote, lucideCheckCheck })
  ],
  template: `
    <div class="page-container animate-fade-in">

      <!-- Header Section -->
      <div class="header-section glass-panel">
        <button routerLink="/community/network" class="back-btn p-2 rounded-full hover:bg-black/5 transition-colors">
          <ng-icon name="lucideChevronLeft" size="20"></ng-icon>
        </button>
        <div>
          <h1 class="page-title">Mes Demandes</h1>
          <p class="page-subtitle">Gérez vos invitations en attente et étendez votre réseau.</p>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs-navigation glass-panel">
        <button 
          (click)="activeTab = 'received'"
          [class.active]="activeTab === 'received'"
          class="tab-item">
          <ng-icon name="lucideInbox"></ng-icon>
          <span>Reçues</span>
          <span class="count-badge" *ngIf="requestsReceived.length > 0">{{ requestsReceived.length }}</span>
        </button>
        <button 
          (click)="activeTab = 'sent'"
          [class.active]="activeTab === 'sent'"
          class="tab-item">
          <ng-icon name="lucideSend"></ng-icon>
          <span>Envoyées</span>
          <span class="count-badge alt" *ngIf="requestsSent.length > 0">{{ requestsSent.length }}</span>
        </button>
      </div>

      <!-- List Content -->
      <div class="list-section">
        
        <!-- Received -->
        <div *ngIf="activeTab === 'received'" class="requests-grid">
          <div *ngFor="let req of requestsReceived; let i = index"
            class="request-card glass-panel hover-lift animate-fade-in-up"
            [style.animation-delay.ms]="i * 50">

            <div class="card-body">
              <div class="user-info">
                <div class="avatar-box received">
                  <ng-icon name="lucideUserPlus"></ng-icon>
                </div>
                <div class="text-info">
                  <h3 class="user-name">{{ getUserName(req.requesterId) }}</h3>
                  <div class="date-tag">
                    <ng-icon name="lucideClock"></ng-icon>
                    <span>Reçue le {{ req.createdAt | date:'dd MMM yyyy' }}</span>
                  </div>
                </div>
              </div>

              <div class="message-bubble" *ngIf="req.message">
                <ng-icon name="lucideQuote"></ng-icon>
                <p>{{ req.message }}</p>
              </div>
            </div>

            <div class="card-actions">
              <button class="btn-accept" (click)="accept(req.id)">
                <ng-icon name="lucideCheckCircle"></ng-icon>
                <span>Accepter</span>
              </button>
              <button class="btn-decline" (click)="decline(req.id)">
                <ng-icon name="lucideXCircle"></ng-icon>
                <span>Refuser</span>
              </button>
            </div>
          </div>

          <div *ngIf="requestsReceived.length === 0" class="empty-state glass-panel animate-scale-in">
            <div class="empty-icon success">
              <ng-icon name="lucideCheckCheck"></ng-icon>
            </div>
            <h3>Boîte de réception vide</h3>
            <p>Toutes vos demandes de connexion ont été traitées.</p>
          </div>
        </div>

        <!-- Sent -->
        <div *ngIf="activeTab === 'sent'" class="requests-grid">
          <div *ngFor="let req of requestsSent; let i = index"
            class="request-card glass-panel hover-lift animate-fade-in-up"
            [style.animation-delay.ms]="i * 50">

            <div class="card-body">
              <div class="user-info">
                <div class="avatar-box sent">
                  <ng-icon name="lucideUser"></ng-icon>
                </div>
                <div class="text-info">
                  <h3 class="user-name">{{ getUserName(req.targetId) }}</h3>
                  <div class="status-tag">En attente d'approbation</div>
                  <div class="date-tag">
                    <ng-icon name="lucideClock"></ng-icon>
                    <span>Envoyée le {{ req.createdAt | date:'dd MMM yyyy' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button class="btn-cancel" (click)="cancelRequest(req.id)">
                <ng-icon name="lucideTrash2"></ng-icon>
                <span>Annuler la demande</span>
              </button>
            </div>
          </div>

          <div *ngIf="requestsSent.length === 0" class="empty-state glass-panel animate-scale-in">
            <div class="empty-icon info">
              <ng-icon name="lucideSend"></ng-icon>
            </div>
            <h3>Aucune demande en cours</h3>
            <p>Vos demandes envoyées apparaîtront ici.</p>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 850px; margin: 40px auto; padding: 0 16px; min-height: 80vh; }

    .header-section {
      display: flex; align-items: center; gap: 20px;
      padding: 32px 40px; border-radius: 24px; margin-bottom: 32px;
      background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
      border: none;
    }
    .back-btn { color: #9A3412; }
    .page-title { margin: 0; font-size: 32px; font-weight: 800; color: #431407; letter-spacing: -1px; }
    .page-subtitle { margin: 6px 0 0; color: #9A3412; font-size: 15px; opacity: 0.7; }

    .tabs-navigation {
      display: flex; gap: 8px; padding: 8px; border-radius: 18px;
      background: white; margin-bottom: 40px; border: 1px solid rgba(0,0,0,0.05);
    }
    .tab-item {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 700;
      color: #64748B; border: none; background: transparent; transition: all 0.2s ease;
      position: relative;
    }
    .tab-item.active { background: #1C4FC3; color: white; box-shadow: 0 8px 16px -4px rgba(28, 79, 195, 0.2); }
    .tab-item:not(.active):hover { background: #F1F5F9; color: #1E293B; }
    
    .count-badge {
      padding: 2px 8px; border-radius: 20px; background: rgba(255,255,255,0.2);
      font-size: 11px; font-weight: 800;
    }
    .tab-item:not(.active) .count-badge { background: #F1F5F9; color: #64748B; }

    .requests-grid { display: flex; flex-direction: column; gap: 16px; }

    .request-card {
      display: flex; flex-direction: column; padding: 0; overflow: hidden;
      border-radius: 24px; background: white; border: 1px solid rgba(0,0,0,0.02);
    }
    
    .card-body { padding: 24px; }
    
    .user-info { display: flex; align-items: center; gap: 20px; }
    .avatar-box {
      width: 56px; height: 56px; border-radius: 16px;
      display: flex; justify-content: center; align-items: center;
      flex-shrink: 0;
    }
    .avatar-box.received { background: #FEF3C7; color: #D97706; }
    .avatar-box.sent { background: #E0F2FE; color: #0284C7; }
    .avatar-box ng-icon { font-size: 28px; width: 28px; height: 28px; }
    
    .text-info { flex: 1; min-width: 0; }
    .user-name { font-size: 18px; font-weight: 800; color: #1E293B; margin-bottom: 4px; }
    
    .date-tag { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94A3B8; font-weight: 600; }
    .status-tag { display: inline-block; font-size: 11px; font-weight: 800; color: #0284C7; text-transform: uppercase; margin-bottom: 4px; }

    .message-bubble {
      margin-top: 20px; padding: 16px 20px; border-radius: 16px;
      background: #F8FAFC; border-left: 4px solid #CBD5E1;
      display: flex; gap: 12px;
    }
    .message-bubble ng-icon { color: #94A3B8; font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; margin-top: 4px; }
    .message-bubble p { margin: 0; font-size: 14px; color: #475569; font-style: italic; line-height: 1.6; }

    .card-actions {
      display: flex; gap: 1px; background: rgba(0,0,0,0.05); border-top: 1px solid rgba(0,0,0,0.05);
    }
    .card-actions button {
      flex: 1; height: 52px; border: none; background: white;
      font-size: 13px; font-weight: 700; display: flex; align-items: center;
      justify-content: center; gap: 8px; transition: all 0.2s ease;
    }
    .btn-accept { color: #059669; }
    .btn-accept:hover { background: #F0FDF4; }
    .btn-decline { color: #94A3B8; }
    .btn-decline:hover { background: #FEF2F2; color: #EF4444; }
    .btn-cancel { color: #EF4444; }
    .btn-cancel:hover { background: #FEF2F2; }

    .empty-state {
      text-align: center; padding: 64px 40px; border-radius: 24px;
      display: flex; flex-direction: column; align-items: center;
    }
    .empty-icon {
      width: 72px; height: 72px; border-radius: 20px;
      display: flex; justify-content: center; align-items: center;
      margin-bottom: 20px;
    }
    .empty-icon.success { background: #DCFCE7; color: #059669; }
    .empty-icon.info { background: #E0F2FE; color: #0284C7; }
    .empty-icon ng-icon { font-size: 36px; width: 36px; height: 36px; }
    
    .empty-state h3 { font-size: 20px; font-weight: 800; color: #1E293B; margin-bottom: 8px; }
    .empty-state p { color: #64748B; font-size: 14px; }

    @media (max-width: 640px) {
      .card-actions { flex-direction: column; }
      .card-actions button { border-bottom: 1px solid rgba(0,0,0,0.05); }
    }
  `]
})
export class PendingRequestsComponent implements OnInit {

  activeTab: 'received' | 'sent' = 'received';
  requestsReceived: MemberConnection[] = [];
  requestsSent: MemberConnection[] = [];
  currentUserId = '';
  private nameByUserId = new Map<string, string>();

  constructor(
    private connectionService: ConnectionService,
    private authService: AuthService,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId()?.toString() || '';
    this.loadRequestsAndDirectory();
  }

  loadRequestsAndDirectory() {
    forkJoin({
      directory: this.userProfileService.loadDirectory(),
      received: this.connectionService.getPendingRequests(this.currentUserId),
      sent: this.connectionService.getSentPendingRequests(this.currentUserId)
    }).subscribe({
      next: ({ directory, received, sent }) => {
        directory.forEach(u => {
          this.nameByUserId.set(String(u.id), this.userProfileService.displayNameFromUser(u));
        });
        this.requestsReceived = received;
        this.requestsSent = sent;
      },
      error: () => {
        console.error('Error loading requests');
      }
    });
  }

  getUserName(userId: string): string {
    return this.nameByUserId.get(userId) || `Utilisateur ${userId}`;
  }

  accept(connectionId: string) {
    this.connectionService.acceptRequest(connectionId).subscribe({
      next: () => {
        this.requestsReceived = this.requestsReceived.filter(r => r.id !== connectionId);
      },
      error: () => {
        console.error('Error accepting');
      }
    });
  }

  decline(connectionId: string) {
    this.connectionService.declineRequest(connectionId).subscribe({
      next: () => {
        this.requestsReceived = this.requestsReceived.filter(r => r.id !== connectionId);
      },
      error: () => {
        console.error('Error declining');
      }
    });
  }

  cancelRequest(connectionId: string) {
    if (!confirm('Voulez-vous vraiment annuler cette demande ?')) return;
    this.connectionService.declineRequest(connectionId).subscribe({
      next: () => {
        this.requestsSent = this.requestsSent.filter(r => r.id !== connectionId);
      },
      error: () => console.error('Error cancelling')
    });
  }
}