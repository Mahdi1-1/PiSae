import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../../../forum/services/group.service';
import { ForumGroup } from '../../../shared/models/forum-group.model';
import { AuthService } from '../../../../../core/services/auth.service';
import { UserProfileService } from '../../../../../core/services/user-profile.service';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../../shared/models/chat-message.model';
import { provideIcons } from '@ng-icons/core';
import { 
  lucideSearch, lucideUsers, lucideBriefcase, lucideChevronRight,
  lucideMessageCircle, lucideUser, lucideMail, lucideCompass,
  lucideMessageSquare
} from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-conversation-list',
  providers: [
    provideIcons({
      lucideSearch, lucideUsers, lucideBriefcase, lucideChevronRight,
      lucideMessageCircle, lucideUser, lucideMail, lucideCompass,
      lucideMessageSquare
    })
  ],
  template: `
    <div class="conversations-container animate-fade-in-up">
      <div class="header-section glass-panel">
        <div class="header-top">
          <h1 class="page-title">Messagerie</h1>
          <div class="header-badge" *ngIf="totalUnread > 0">
            {{ totalUnread }} non lu{{ totalUnread > 1 ? 's' : '' }}
          </div>
        </div>
        <p class="page-subtitle">Discutez avec vos groupes et vos connexions.</p>
      </div>

      <!-- Search -->
      <div class="search-field form-group mb-6 relative">
        <ng-icon name="lucideSearch" class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></ng-icon>
        <input type="text" class="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Rechercher une conversation..." [(ngModel)]="searchTerm" (input)="applyFilters()" />
      </div>

      <div class="list-wrapper">

        <!-- Group Conversations -->
        <div class="section" *ngIf="filteredGroups.length > 0">
          <div class="section-title">
            <div class="section-icon"><ng-icon name="lucideUsers"></ng-icon></div>
            <span>Groupes Sectoriels</span>
            <span class="section-count">{{ filteredGroups.length }}</span>
          </div>

          <div *ngFor="let group of filteredGroups; let i = index"
            class="conversation-item hover-lift animate-fade-in-up"
            [style.animation-delay.ms]="i * 50"
            (click)="openGroupChat(group.id)">

            <div class="avatar group-avatar">
              <ng-icon name="lucideUsers"></ng-icon>
            </div>
            <div class="details">
              <div class="conv-title">{{ group.name }}</div>
              <div class="conv-subtitle">
                <ng-icon name="lucideBriefcase"></ng-icon>
                {{ group.sector }} · {{ group.memberCount || 0 }} membres
              </div>
            </div>
            <div class="unread-badge" *ngIf="getGroupUnreadCount(group.id) > 0">
              {{ getGroupUnreadCount(group.id) }}
            </div>
            <ng-icon name="lucideChevronRight" class="chevron"></ng-icon>
          </div>
        </div>

        <!-- Private Messages -->
        <div class="section" *ngIf="filteredPrivateConversations.length > 0">
          <div class="section-title">
            <div class="section-icon private"><ng-icon name="lucideMessageCircle"></ng-icon></div>
            <span>Messages Privés</span>
            <span class="section-count warn" *ngIf="getPrivateUnreadCount() > 0">{{ getPrivateUnreadCount() }}</span>
          </div>

          <div *ngFor="let priv of filteredPrivateConversations; let i = index"
            class="conversation-item hover-lift animate-fade-in-up"
            [class.unread]="priv.unreadCount > 0"
            [style.animation-delay.ms]="i * 50"
            (click)="openPrivateChat(priv.partnerId)">

            <div class="avatar private-avatar">
              <ng-icon name="lucideUser"></ng-icon>
            </div>
            <div class="details">
              <div class="conv-title">{{ getPrivateSenderLabel(priv.partnerId) }}</div>
              <div class="conv-subtitle message-preview" [class.unread-text]="priv.unreadCount > 0">
                {{ priv.lastMessage | slice:0:50 }}{{ priv.lastMessage.length > 50 ? '...' : '' }}
              </div>
            </div>
            <div class="unread-badge" *ngIf="priv.unreadCount > 1">
              {{ priv.unreadCount }}
            </div>
            <div class="unread-dot" *ngIf="priv.unreadCount === 1"></div>
            <ng-icon name="lucideChevronRight" class="chevron"></ng-icon>
          </div>
        </div>

        <!-- Message Invitations (Message Requests) -->
        <div class="section" *ngIf="filteredInvitations.length > 0">
          <div class="section-title">
            <div class="section-icon invitation"><ng-icon name="lucideMail"></ng-icon></div>
            <span>Invitations par message</span>
            <span class="section-count danger">{{ filteredInvitations.length }}</span>
          </div>

          <div *ngFor="let invite of filteredInvitations; let i = index"
            class="conversation-item invitation-item hover-lift animate-fade-in-up"
            [style.animation-delay.ms]="i * 50"
            (click)="openPrivateChat(invite.partnerId)">

            <div class="avatar invitation-avatar">
              <ng-icon name="lucideMail"></ng-icon>
            </div>
            <div class="details">
              <div class="conv-title">{{ getPrivateSenderLabel(invite.partnerId) }}</div>
              <div class="conv-subtitle message-preview">
                {{ invite.lastMessage | slice:0:50 }}{{ invite.lastMessage.length > 50 ? '...' : '' }}
              </div>
            </div>
            <ng-icon name="lucideChevronRight" class="chevron"></ng-icon>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredGroups.length === 0 && filteredPrivateConversations.length === 0" class="empty-state animate-scale-in">
          <div class="empty-icon-wrapper">
            <ng-icon name="lucideMessageSquare"></ng-icon>
          </div>
          <h3>{{ searchTerm ? 'Aucun résultat' : 'Pas de conversations' }}</h3>
          <p>{{ searchTerm ? 'Essayez un autre mot-clé.' : 'Rejoignez des groupes pour commencer à discuter !' }}</p>
          <button type="button" class="btn-primary-inline explore-link flex items-center gap-1.5 mx-auto" routerLink="/community/forum/groups" *ngIf="!searchTerm">
            <ng-icon name="lucideCompass"></ng-icon> Explorer les groupes
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .conversations-container { max-width: 800px; margin: 40px auto; padding: 0 16px; min-height: 80vh; }

    .header-section {
      padding: 24px 28px; border-radius: 20px; margin-bottom: 24px;
      background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%);
      border: none;
    }
    .header-top { display: flex; justify-content: space-between; align-items: center; }
    .page-title { margin: 0; font-size: 26px; font-weight: 800; color: var(--co-secondary); }
    .page-subtitle { margin: 6px 0 0; color: var(--co-text-muted); font-size: 14px; }
    .header-badge {
      background: var(--co-primary); color: white; border-radius: 20px;
      padding: 4px 14px; font-size: 12px; font-weight: 700;
      box-shadow: var(--shadow-glow-sm);
    }

    .search-field { width: 100%; margin-bottom: 24px; }

    .list-wrapper { }

    .section { margin-bottom: 28px; }
    .section-title {
      display: flex; align-items: center; gap: 10px;
      padding: 0 4px; margin-bottom: 12px;
      font-size: 13px; font-weight: 700; color: var(--co-text-muted);
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .section-icon {
      width: 28px; height: 28px; border-radius: 8px;
      background: var(--co-primary-light); color: var(--co-primary);
      display: flex; justify-content: center; align-items: center;
    }
    .section-icon.private { background: #FFF7ED; color: #EA580C; }
    .section-icon.invitation { background: #F0FDF4; color: #16A34A; }
    .section-icon ng-icon { font-size: 16px; width: 16px; height: 16px; }
    .section-count {
      background: var(--co-background); color: var(--co-text-muted);
      padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
    }
    .section-count.warn { background: #FEF2F2; color: var(--co-danger); }
    .section-count.danger { background: #DC2626; color: white; }

    .conversation-item {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px; margin-bottom: 6px; border-radius: 14px;
      cursor: pointer; background: white;
      border: 1px solid rgba(0,0,0,0.04);
      transition: all var(--transition-medium);
    }
    .conversation-item:hover {
      background: var(--co-primary-light);
      border-color: rgba(79, 70, 229, 0.1);
    }
    .conversation-item.unread { background: #FFFBF5; border-color: rgba(234, 88, 12, 0.1); }

    .avatar {
      width: 46px; height: 46px; border-radius: 14px;
      display: flex; justify-content: center; align-items: center;
      flex-shrink: 0;
    }
    .group-avatar {
      background: linear-gradient(135deg, var(--co-primary-light), #C7D2FE);
      color: var(--co-primary);
    }
    .private-avatar {
      background: linear-gradient(135deg, #FFF7ED, #FED7AA);
      color: #C2410C;
    }
    .invitation-avatar {
      background: linear-gradient(135deg, #F0FDF4, #BBF7D0);
      color: #166534;
    }
    .avatar ng-icon { font-size: 22px; width: 22px; height: 22px; }

    .details { flex: 1; min-width: 0; }
    .conv-title {
      font-weight: 700; font-size: 15px; color: var(--co-secondary);
      margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .conv-subtitle {
      display: flex; align-items: center; gap: 4px;
      font-size: 13px; color: var(--co-text-muted);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .conv-subtitle ng-icon { font-size: 14px; width: 14px; height: 14px; }
    .message-preview { font-weight: 400; color: #64748B; }
    .message-preview.unread-text { font-weight: 600; color: #0F172A; }

    .unread-badge {
      background: var(--co-primary); color: white; border-radius: 12px;
      padding: 2px 10px; font-size: 11px; font-weight: 700;
      box-shadow: var(--shadow-glow-sm); flex-shrink: 0;
    }
    .unread-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: #EA580C; flex-shrink: 0;
      box-shadow: 0 0 8px rgba(234, 88, 12, 0.4);
    }

    .chevron {
      font-size: 20px; width: 20px; height: 20px;
      color: #CBD5E1; transition: all var(--transition-medium);
    }
    .conversation-item:hover .chevron { color: var(--co-primary); transform: translateX(4px); }

    .empty-state {
      text-align: center; padding: 60px 40px; border-radius: 20px; background: white;
      border: 1px solid rgba(0,0,0,0.05);
    }
    .empty-icon-wrapper {
      width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 20px;
      background: linear-gradient(135deg, var(--co-primary-light), #C7D2FE);
      display: flex; justify-content: center; align-items: center;
    }
    .empty-icon-wrapper ng-icon { font-size: 36px; width: 36px; height: 36px; color: var(--co-primary); }
    .empty-state h3 { font-size: 20px; font-weight: 700; color: var(--co-secondary); margin: 0 0 8px; }
    .empty-state p { color: var(--co-text-muted); font-size: 14px; margin: 0 0 20px; }
    .explore-link { font-weight: 600; padding: 10px 20px; }
  `]
})
export class ConversationListComponent implements OnInit, OnDestroy {

  myGroups: ForumGroup[] = [];
  filteredGroups: ForumGroup[] = [];
  
  privateConversations: { partnerId: string, unreadCount: number, lastMessage: string }[] = [];
  filteredPrivateConversations: { partnerId: string, unreadCount: number, lastMessage: string }[] = [];
  
  invitations: { partnerId: string, lastMessage: string }[] = [];
  filteredInvitations: { partnerId: string, lastMessage: string }[] = [];
  
  unreadMessages: ChatMessage[] = [];
  currentUserId = '';
  searchTerm = '';
  totalUnread = 0;
  
  private senderLabels = new Map<string, string>();
  private unreadSub: any;

  constructor(
    private groupService: GroupService,
    private chatService: ChatService,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId()?.toString() || '';
    
    // Resolve identity profiles 
    this.userProfileService.loadDirectory().subscribe(users =>
      users.forEach(u => this.senderLabels.set(String(u.id), this.userProfileService.displayNameFromUser(u)))
    );
    
    this.loadMyGroups();
    this.loadRecentConversations();
    this.fetchInvitations();

    // Subscribe to shared unread state (managed by ChatService)
    this.unreadSub = this.chatService.unreadMessages$.subscribe(msgs => {
      this.unreadMessages = msgs;
      this.totalUnread = msgs.length;
      this.extractPrivateConversations(msgs);
      this.applyFilters();
    });

    // Initial fetch
    this.chatService.refreshUnreadStatus(this.currentUserId);
  }

  loadRecentConversations() {
    this.chatService.getConversations(this.currentUserId).subscribe(msgs => {
      this.fullConversationRecords = msgs;
      this.mergeAndApplyConversations();
    });
  }

  getPrivateSenderLabel(userId: string): string {
    return this.senderLabels.get(String(userId)) || `Utilisateur ${userId}`;
  }

  loadMyGroups() {
    this.groupService.getAllGroups().subscribe(groups => {
      // Find groups where I am a member
      const uid = String(this.currentUserId);
      this.myGroups = groups.filter(g =>
        (g.memberIds || []).some(m => String(m) === uid)
      );
      this.applyFilters();
    });
  }

  fetchUnreadMessages() {
    this.chatService.refreshUnreadStatus(this.currentUserId);
  }

  fetchInvitations() {
    this.chatService.getInvitations(this.currentUserId).subscribe(invites => {
      this.extractInvitations(invites);
      this.applyFilters();
    });
  }

  private extractInvitations(msgs: ChatMessage[]) {
    const map = new Map<string, string>();
    msgs.forEach(m => {
      const partnerId = String(m.senderId);
      map.set(partnerId, m.content || '...');
    });
    
    this.invitations = Array.from(map.entries()).map(([partnerId, lastMessage]) => ({
      partnerId,
      lastMessage
    }));
  }

  private mergeAndApplyConversations() {
    const map = new Map<string, { unreadCount: number, lastMessage: string }>();

    // 1. Fill from full history (base)
    this.fullConversationRecords.forEach(m => {
      const partnerId = m.senderId === this.currentUserId ? m.receiverId : m.senderId;
      if (partnerId && m.type === 'PRIVATE' || m.type === 'INVITATION') {
         map.set(String(partnerId), { unreadCount: 0, lastMessage: m.content || '...' });
      }
    });

    // 2. Overlay unread counts
    this.unreadMessages.forEach(m => {
      const partnerId = String(m.senderId);
      if (map.has(partnerId)) {
        map.get(partnerId)!.unreadCount++;
        map.get(partnerId)!.lastMessage = m.content || '...';
      } else {
        // Just in case it's not in the 'recent 50' or whatever limit we put
        map.set(partnerId, { unreadCount: 1, lastMessage: m.content || '...' });
      }
    });

    this.privateConversations = Array.from(map.entries()).map(([partnerId, data]) => ({
      partnerId,
      unreadCount: data.unreadCount,
      lastMessage: data.lastMessage
    }));
  }

  private fullConversationRecords: ChatMessage[] = [];

  private extractPrivateConversations(msgs: ChatMessage[]) {
    this.unreadMessages = msgs;
    this.mergeAndApplyConversations();
  }

  getGroupUnreadCount(groupId: string): number {
    return this.unreadMessages.filter(m => String(m.groupId) === String(groupId)).length;
  }
  
  getPrivateUnreadCount(): number {
    return this.privateConversations.reduce((acc, conv) => acc + conv.unreadCount, 0);
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredGroups = this.myGroups;
      this.filteredPrivateConversations = this.privateConversations;
      this.filteredInvitations = this.invitations;
      return;
    }
    
    // Group search
    this.filteredGroups = this.myGroups.filter(g => 
      (g.name || '').toLowerCase().includes(term) || 
      (g.sector || '').toLowerCase().includes(term)
    );
    
    // Private search
    this.filteredPrivateConversations = this.privateConversations.filter(p => {
      const name = this.getPrivateSenderLabel(p.partnerId).toLowerCase();
      return name.includes(term);
    });

    // Invitations search
    this.filteredInvitations = this.invitations.filter(i => {
      const name = this.getPrivateSenderLabel(i.partnerId).toLowerCase();
      return name.includes(term);
    });
  }

  openGroupChat(groupId: string) {
    this.router.navigate(['/community/messaging/group', groupId]);
  }

  openPrivateChat(userId: string) {
    this.router.navigate(['/community/messaging/private', userId]);
  }

  ngOnDestroy() {
    this.unreadSub?.unsubscribe();
  }
}