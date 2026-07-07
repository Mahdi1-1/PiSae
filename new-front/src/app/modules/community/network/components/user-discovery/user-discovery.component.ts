import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectionService } from '../../services/connection.service';
import { UserService } from '../../services/user.service';
import { User, Role } from '../../../../../core/models/user.model';
import { AuthService } from '../../../../../core/services/auth.service';


@Component({
  standalone: false,
  selector: 'app-user-discovery',
  template: `
    <div class="discovery-container animate-fade-in-up">
      
      <!-- Header -->
      <div class="header-section glass-panel">
        <button routerLink="/community/network" class="back-btn p-2 rounded-full hover:bg-white/50 transition-colors">
          <ng-icon name="lucideArrowLeft" size="20"></ng-icon>
        </button>
        <div>
          <h1 class="page-title">Découvrir des membres</h1>
          <p class="page-subtitle">Trouvez et connectez-vous avec d'autres professionnels</p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="search-section">
        <div class="search-field">
          <label class="text-sm font-bold mb-2 block text-slate-700">Rechercher par nom...</label>
          <div class="relative">
            <input 
              class="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 pl-11 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              [(ngModel)]="searchQuery" 
              (ngModelChange)="filterUsers()"
              placeholder="Ex: John, Alice...">
            <ng-icon name="lucideSearch" class="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size="18"></ng-icon>
          </div>
        </div>
        <div class="role-filter">
          <label class="text-sm font-bold mb-2 block text-slate-700">Filtrer par rôle</label>
          <div class="relative">
            <select 
              class="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 pl-11 text-sm appearance-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              [(ngModel)]="roleFilter" (ngModelChange)="filterUsers()">
              <option value="">Tous les rôles</option>
              <option *ngFor="let r of roles" [value]="r">{{r}}</option>
            </select>
            <ng-icon name="lucideFilter" class="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size="18"></ng-icon>
          </div>
        </div>
      </div>

      <!-- Results Grid -->
      <div class="results-section">
        <h2 class="section-title">
          <ng-icon name="lucideUsers" size="24"></ng-icon>
          Membres suggérés ({{ filteredUsers.length }})
        </h2>
        
        <div class="users-grid" *ngIf="!loading">
          <div *ngFor="let user of filteredUsers; let i = index"
            class="user-card animate-fade-in-up"
            [style.animation-delay.ms]="i * 80">
            
            <div class="card-glow"></div>
            
            <div class="user-avatar">
              <ng-icon name="lucideUser"></ng-icon>
            </div>
            
            <div class="user-info">
              <span class="user-role" [class]="user.role.toLowerCase()">{{ user.role }}</span>
              <h3>{{ user.name }} {{ user.prenom }}</h3>
              <p class="user-sector">{{ user.email }}</p>
              <p class="user-bio">Entrepreneur passionné par l'innovation et les nouvelles technologies.</p>
            </div>
            
            <div class="user-actions">
              <button 
                class="connect-btn flex items-center justify-center gap-2"
                [disabled]="connectionStatus[user.id] === 'CONNECTED' || connectionStatus[user.id] === 'PENDING'"
                (click)="sendConnectionRequest(user)">
                <ng-icon *ngIf="!connectionStatus[user.id]" name="lucideUserPlus" size="18"></ng-icon>
                <ng-icon *ngIf="connectionStatus[user.id] === 'PENDING'" name="lucideCheck" size="18"></ng-icon>
                <span>{{ connectionStatus[user.id] === 'CONNECTED' ? 'Connecté' : connectionStatus[user.id] === 'PENDING' ? 'Envoyé' : 'Se connecter' }}</span>
              </button>

              <button 
                class="message-btn flex items-center justify-center"
                (click)="goToMessage(user)">
                <ng-icon name="lucideMessageSquare" size="18"></ng-icon>
              </button>
            </div>
          </div>
        </div>
        
        <div *ngIf="filteredUsers.length === 0 && !loading" class="empty-state animate-scale-in">
          <ng-icon name="lucideSearchX" size="48" class="text-slate-300 mb-4"></ng-icon>
          <h3>Aucun membre trouvé</h3>
          <p>Essayez d'ajuster vos critères de recherche.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
        <ng-icon name="lucideLoader2" class="animate-spin mb-4" size="48"></ng-icon>
        <p class="font-medium">Recherche de talents...</p>
      </div>

    </div>
  `,
  styles: [`
    .discovery-container { max-width: 1200px; margin: 40px auto; padding: 0 16px; }
    
    .header-section {
      display: flex; align-items: center; gap: 16px;
      padding: 24px; background: white; border-radius: 20px;
      border: 1px solid rgba(0,0,0,0.05); margin-bottom: 24px;
    }
    
    .search-section {
      display: flex; gap: 16px; align-items: flex-start;
      margin-bottom: 32px;
    }
    
    .search-field {
      flex: 1; background: white;
    }
    
    .search-btn {
      height: 56px; border-radius: 16px; font-weight: 600;
      min-width: 140px;
    }
    
    .section-title {
      display: flex; align-items: center; gap: 12px;
      font-size: 20px; font-weight: 700; color: var(--co-secondary);
      margin: 0 0 24px 0;
    }
    
    .users-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }
    
    .user-card {
      background: white; border-radius: 20px; padding: 24px;
      border: 1px solid rgba(0,0,0,0.05); transition: var(--transition-fast);
    }
    
    .user-avatar {
      width: 60px; height: 60px; border-radius: 50%;
      background: var(--co-primary-light); color: var(--co-primary);
      display: flex; justify-content: center; align-items: center;
      margin: 0 auto 16px;
    }
    
    .user-avatar ng-icon { font-size: 30px; width: 30px; height: 30px; }
    
    .user-info h3 {
      font-size: 18px; font-weight: 700; color: var(--co-secondary);
      margin: 0 0 8px 0; text-align: center;
    }
    
    .user-role {
      background: var(--co-primary-light); color: var(--co-primary);
      padding: 4px 12px; border-radius: 12px; font-size: 12px;
      font-weight: 600; text-align: center; margin: 0 0 8px 0;
    }
    
    .user-sector {
      color: var(--co-text-muted); font-size: 14px; text-align: center; margin: 0 0 8px 0;
    }
    
    .user-bio {
      color: var(--co-text-main); font-size: 14px; line-height: 1.5;
      text-align: center; margin: 0 0 16px 0; min-height: 60px;
    }
    
    .user-skills {
      display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;
      margin-bottom: 16px;
    }
    
    .skill-chip {
      font-size: 11px; height: 24px; background: var(--co-background);
    }
    
    .more-skills {
      font-size: 11px; color: var(--co-text-muted); font-weight: 600;
    }
    
    .user-actions {
      display: flex; gap: 10px; margin-top: auto;
    }
    
    .connect-btn, .message-btn {
      flex: 1; border-radius: 12px; font-weight: 600;
      transition: var(--transition-fast); font-size: 13px;
    }
    
    .message-btn {
      border-color: var(--co-primary); color: var(--co-primary);
    }
    
    .message-btn:hover { background: var(--co-primary-light); }
    
    .connect-btn:disabled {
      background: var(--co-background) !important; color: var(--co-text-muted) !important;
    }
    
    .empty-state {
      text-align: center; padding: 60px 40px; color: var(--co-text-muted);
    }
    
    .empty-state ng-icon {
      color: #CBD5E1; margin-bottom: 16px;
    }
    
    .empty-state h3 {
      font-size: 20px; font-weight: 700; margin: 0 0 8px 0;
    }
    
    .loading-state {
      text-align: center; padding: 60px; color: var(--co-text-muted);
    }
    
    .loading-state ng-icon {
      margin-bottom: 16px;
    }
    
    @media (max-width: 768px) {
      .search-section { flex-direction: column; }
      .search-btn { width: 100%; margin-top: 12px; }
      .users-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class UserDiscoveryComponent implements OnInit {

  searchQuery = '';
  roleFilter = '';
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  currentUserId = '';
  connectionStatus: { [key: number]: 'CONNECTED' | 'PENDING' | null } = {};
  roles = ['USER', 'ADMIN', 'MENTOR', 'PARTENAIRE', 'ENTREPRENEUR', 'INVESTISSEUR', 'ETUDIANT'];

  constructor(
    private router: Router,
    private connectionService: ConnectionService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId()?.toString() || '';
    this.loadAllUsers();
  }

  loadAllUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        // Exclure l'utilisateur actuel
        this.allUsers = users.filter(u => u.id.toString() !== this.currentUserId);
        this.filteredUsers = [...this.allUsers];
        this.loading = false;
        this.checkConnections();
      },
      error: () => {
        this.loading = false;
        console.error('Erreur lors du chargement des membres');
        alert('Erreur lors du chargement des membres');
      }
    });
  }

  checkConnections() {
    this.connectionService.getAllConnections(this.currentUserId).subscribe(connections => {
      connections.forEach(c => {
        const otherId = c.requesterId === this.currentUserId ? c.targetId : c.requesterId;
        if (c.status === 'ACCEPTED') {
          this.connectionStatus[parseInt(otherId)] = 'CONNECTED';
        } else if (c.status === 'PENDING') {
          this.connectionStatus[parseInt(otherId)] = 'PENDING';
        }
      });
    });
  }

  filterUsers() {
    let users = this.allUsers;
    if (this.roleFilter) {
      users = users.filter(u => u.role === this.roleFilter);
    }
    if (this.searchQuery.trim()) {
      const sq = this.searchQuery.toLowerCase();
      users = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(sq)) || 
        (u.prenom && u.prenom.toLowerCase().includes(sq))
      );
    }
    this.filteredUsers = users;
  }

  sendConnectionRequest(user: User) {
    this.connectionService.sendRequest(this.currentUserId, user.id.toString(), 
      `Bonjour ${user.prenom}, j'aimerais me connecter avec vous.`
    ).subscribe({
      next: () => {
        this.connectionStatus[user.id] = 'PENDING';
        alert('Demande de connexion envoyée !');
      },
      error: () => {
        alert('Erreur lors de l\'envoi de la demande');
      }
    });
  }

  goToMessage(user: User) {
    this.router.navigate(['/community/messaging/private', user.id]);
  }
}
