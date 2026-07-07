import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { ForumGroup } from '../../../shared/models/forum-group.model';
import { AuthService } from '../../../../../core/services/auth.service';
import { SharedModule } from '../../../shared/shared.module';
import { provideIcons } from '@ng-icons/core';
import { lucideUsers, lucideBriefcase } from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-group-list',
  providers: [
    provideIcons({
      lucideUsers, lucideBriefcase
    })
  ],
  template: `
    <div class="groups-container animate-fade-in-up">
      <div class="header-section glass-panel">
        <div>
          <h1 class="page-title">Groupes Sectoriels</h1>
          <p class="page-subtitle">Rejoignez des experts de votre domaine et partagez vos connaissances.</p>
        </div>
      </div>

      <div class="groups-grid">
        <div *ngFor="let group of groups" class="group-card hover-lift glass-panel"
             style="cursor:pointer;"
             [routerLink]="['/community/forum/group', group.id]">
          
          <div class="card-hero">
            <ng-icon name="lucideBriefcase" class="hero-icon"></ng-icon>
            <span class="visibility-badge">{{ group.visibility }}</span>
          </div>

          <div class="card-body">
            <h3 class="group-name">{{ group.name }}</h3>
            <span class="sector-label">{{ group.sector }}</span>
            <p class="group-desc">{{ group.description | slice:0:100 }}{{ group.description.length > 100 ? '...' : '' }}</p>
          </div>
          
          <div class="card-footer">
            <div class="member-count flex items-center gap-1.5">
              <ng-icon name="lucideUsers"></ng-icon>
              <span>{{ group.memberCount }} membres</span>
            </div>
            
            <button type="button" class="btn-primary-inline join-btn"
              *ngIf="!isMember(group)"
              (click)="joinGroup($event, group)">
              Rejoindre
            </button>
            <button type="button" class="text-red-600 font-semibold hover:bg-red-50 px-4 py-2 rounded-full transition-colors leave-btn"
              *ngIf="isMember(group)"
              (click)="leaveGroup($event, group)">
              Quitter
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .groups-container { max-width: 1000px; margin: 40px auto; padding: 0 16px; min-height: 80vh; }
    
    .header-section { 
      padding: 24px; border-radius: 16px; margin-bottom: 32px;
      background: linear-gradient(135deg, var(--co-surface) 0%, var(--co-background) 100%);
    }
    .page-title { margin: 0; font-size: 28px; font-weight: 800; color: var(--co-secondary); }
    .page-subtitle { margin: 4px 0 0; color: var(--co-text-muted); font-size: 14px; }

    .groups-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    
    .group-card { 
      display: flex; flex-direction: column; border-radius: 16px; 
      background: white; overflow: hidden; border: 1px solid rgba(0,0,0,0.05);
    }
    
    .card-hero { 
      height: 100px; background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      display: flex; justify-content: center; align-items: center; position: relative;
    }
    .hero-icon { font-size: 48px; width: 48px; height: 48px; color: var(--co-primary); opacity: 0.8; }
    .visibility-badge { 
      position: absolute; top: 12px; right: 12px; font-size: 11px; font-weight: 600;
      background: white; color: var(--co-text-main); padding: 4px 10px; border-radius: 12px;
      box-shadow: var(--shadow-sm);
    }
    
    .card-body { padding: 20px; flex: 1; text-align: center; }
    .group-name { margin: 0 0 4px 0; font-size: 18px; font-weight: 700; color: var(--co-secondary); }
    .sector-label { font-size: 12px; color: var(--co-primary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .group-desc { margin: 12px 0 0; color: var(--co-text-muted); font-size: 14px; line-height: 1.5; }
    
    .card-footer { 
      padding: 16px 20px; border-top: 1px solid var(--co-background); 
      display: flex; justify-content: space-between; align-items: center;
    }
    .member-count { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--co-text-muted); font-weight: 500; }
    .member-count ng-icon { font-size: 18px; width: 18px; height: 18px; }
    
    .join-btn { border-radius: 20px; font-weight: 600; padding: 6px 20px; }
  `]
})
export class GroupListComponent implements OnInit {

  groups: ForumGroup[] = [];
  currentUserId = '';

  constructor(
    private groupService: GroupService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId()?.toString() || '';
    this.groupService.getAllGroups().subscribe(groups => this.groups = groups);
  }

  isMember(group: ForumGroup): boolean {
    return group.memberIds.includes(this.currentUserId);
  }

  joinGroup(event: Event, group: ForumGroup) {
    event.stopPropagation();
    this.groupService.joinGroup(group.id, this.currentUserId).subscribe({
      next: updated => {
        const index = this.groups.findIndex(g => g.id === group.id);
        if (index !== -1) this.groups[index] = updated;
        alert('Vous avez rejoint le groupe ! 🎉');
      },
      error: () => {
        alert('Erreur lors de la jonction');
      }
    });
  }

  leaveGroup(event: Event, group: ForumGroup) {
    event.stopPropagation();
    this.groupService.leaveGroup(group.id, this.currentUserId).subscribe({
      next: updated => {
        const index = this.groups.findIndex(g => g.id === group.id);
        if (index !== -1) this.groups[index] = updated;
        alert('Vous avez quitté le groupe');
      },
      error: () => {
        alert('Erreur lors du départ');
      }
    });
  }
}