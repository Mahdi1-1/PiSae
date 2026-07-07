import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MemberConnection } from '../../../shared/models/connection.model';

@Component({
  standalone: false,
  selector: 'app-member-card',
  template: `
    <div class="member-card hover-lift">
      <div class="card-top">
        <div class="avatar-wrapper">
          <div class="avatar-circle">
            <ng-icon name="lucideUser"></ng-icon>
          </div>
          <div class="status-dot" [class]="connection.status.toLowerCase()" 
               [title]="connection.status"></div>
        </div>
        <div class="member-info">
          <div class="member-name">
            {{ displayName }}
          </div>
          <div class="connection-meta">
            <span class="status-chip" [class]="connection.status.toLowerCase()">
              {{ getStatusLabel(connection.status) }}
            </span>
          </div>
          <div class="connected-date">
            <ng-icon name="lucideCalendar"></ng-icon>
            Connecté le {{ connection.acceptedAt | date:'dd MMM yyyy' }}
          </div>
        </div>
      </div>

      <div class="card-actions">
        <button class="action-btn msg-btn inline-flex items-center justify-center gap-2" (click)="messageClicked.emit(getOtherId())">
          <ng-icon name="lucideMessageSquare"></ng-icon> Message
        </button>
        <button class="action-btn block-btn inline-flex items-center justify-center gap-2" (click)="blockClicked.emit(connection.id)">
          <ng-icon name="lucideBan"></ng-icon> Bloquer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .member-card {
      background: white; border-radius: 16px; padding: 24px;
      border: 1px solid rgba(0,0,0,0.05); box-shadow: var(--shadow-sm);
      display: flex; flex-direction: column; gap: 20px; height: 100%;
      transition: border-color var(--transition-medium);
    }
    .member-card:hover { border-color: var(--co-primary-light); }

    .card-top { display: flex; align-items: flex-start; gap: 16px; }

    .avatar-wrapper { position: relative; flex-shrink: 0; }
    .avatar-circle {
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #C7D2FE, #A5B4FC);
      color: var(--co-primary-dark); display: flex;
      justify-content: center; align-items: center;
    }
    .avatar-circle ng-icon { font-size: 28px; width: 28px; height: 28px; }

    .status-dot {
      position: absolute; bottom: 2px; right: 2px;
      width: 14px; height: 14px; border-radius: 50%;
      border: 3px solid white;
    }
    .status-dot.accepted { background: var(--co-success); }
    .status-dot.pending { background: var(--co-warning); }
    .status-dot.blocked { background: var(--co-danger); }

    .member-info { flex: 1; min-width: 0; }
    .member-name {
      font-size: 16px; font-weight: 700; color: var(--co-secondary);
      margin-bottom: 8px; white-space: nowrap; overflow: hidden;
      text-overflow: ellipsis;
    }

    .connection-meta { margin-bottom: 8px; }
    .status-chip {
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 11px !important; font-weight: 600 !important;
      height: 24px !important; border-radius: 12px; padding: 0 10px;
    }
    .status-chip.accepted { background: #ECFDF5 !important; color: #059669 !important; }
    .status-chip.pending { background: #FFF7ED !important; color: #EA580C !important; }
    .status-chip.blocked { background: #FEF2F2 !important; color: #DC2626 !important; }

    .connected-date {
      display: flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--co-text-muted); font-weight: 500;
    }
    .connected-date ng-icon { font-size: 14px; width: 14px; height: 14px; }

    .card-actions {
      display: flex; gap: 8px; margin-top: auto;
      padding-top: 16px; border-top: 1px solid var(--co-background);
    }
    .action-btn {
      flex: 1; border-radius: 12px; font-weight: 600; font-size: 13px;
      height: 38px;
    }
    .msg-btn { background: var(--co-primary-light); color: var(--co-primary-dark); }
    .msg-btn:hover { background: #C7D2FE; }
    .block-btn { color: var(--co-text-muted); }
    .block-btn:hover { background: #FEF2F2; color: var(--co-danger); }
  `]
})
export class MemberCardComponent {
  @Input() connection!: MemberConnection;
  @Input() currentUserId = '';
  /** Resolved from MySQL via user service (name + prenom). */
  @Input() displayName = '';
  @Output() blockClicked = new EventEmitter<string>();
  @Output() messageClicked = new EventEmitter<string>();

  getOtherId(): string {
    return this.connection.requesterId === this.currentUserId
      ? this.connection.targetId
      : this.connection.requesterId;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACCEPTED': return 'Connecté';
      case 'PENDING': return 'En attente';
      case 'BLOCKED': return 'Bloqué';
      default: return status;
    }
  }
}