import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { UserProfileService } from '../../../../../core/services/user-profile.service';
import { ChatMessage } from '../../../shared/models/chat-message.model';
import { Subscription } from 'rxjs';
import { provideIcons } from '@ng-icons/core';
import { 
  lucideChevronLeft, lucideUsers, lucideUser, lucideTrash2,
  lucideMail, lucideClipboardList, lucideHand, lucideSend
} from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-chat-window',
  providers: [
    provideIcons({
      lucideChevronLeft, lucideUsers, lucideUser, lucideTrash2,
      lucideMail, lucideClipboardList, lucideHand, lucideSend
    })
  ],
  template: `
    <div class="chat-container animate-fade-in-up">
      <div class="chat-wrapper glass-panel">
        
        <!-- Header -->
        <div class="chat-header">
          <button type="button" routerLink="/community/messaging" class="back-btn flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ng-icon name="lucideChevronLeft" size="20"></ng-icon>
          </button>
          
          <div class="chat-title-info">
            <div class="avatar-mini">
              <ng-icon [name]="isGroupChat ? 'lucideUsers' : 'lucideUser'"></ng-icon>
            </div>
            <div class="title-texts">
              <span class="chat-name">{{ isGroupChat ? 'Groupe ' + groupId : getSenderName(targetUserId) }}</span>
              <div class="connection-status" [class.connected]="isConnected">
                <span class="status-dot"></span>
                <span>{{ isConnected ? 'En ligne' : 'Connexion en cours...' }}</span>
              </div>
            </div>
          </div>
          
          <div class="header-spacer"></div>
          
          <button type="button" *ngIf="!isGroupChat" class="text-red-500 hover:bg-red-50 p-2 rounded-full flex items-center justify-center transition-colors" (click)="deleteConversation()" title="Supprimer la conversation">
            <ng-icon name="lucideTrash2" size="20"></ng-icon>
          </button>
        </div>

        <!-- Invitation Banner -->
        <div class="invitation-banner animate-fade-in" *ngIf="isInvitation && !isGroupChat">
          <div class="banner-content">
            <ng-icon name="lucideMail" class="banner-icon"></ng-icon>
            <div class="banner-text">
              <strong>Demande de message</strong>
              <span>Souhaitez-vous autoriser {{ getSenderName(targetUserId) }} à vous envoyer des messages ?</span>
            </div>
          </div>
          <div class="banner-actions">
            <button type="button" class="btn-primary-inline px-4 py-2" (click)="acceptInvitation()">ACCEPTER</button>
            <button type="button" class="text-red-600 font-semibold hover:bg-red-50 px-4 py-2 rounded-full transition-colors" (click)="deleteConversation()">IGNORER</button>
          </div>
        </div>

        <!-- Messages -->
        <div class="messages-area" #messagesContainer>
          <div *ngFor="let msg of messages"
            class="message"
            [class.own]="isOwnMessage(msg)"
            [class.system]="msg.type === 'JOIN' || msg.type === 'LEAVE'">

            <!-- System message -->
            <div *ngIf="msg.type === 'JOIN' || msg.type === 'LEAVE'" class="system-msg">
              <span>{{ msg.content }}</span>
            </div>

            <!-- Regular message -->
            <div *ngIf="msg.type === 'CHAT' || msg.type === 'PRIVATE' || msg.type === 'INVITATION'" class="message-bubble">
              <div class="sender" *ngIf="!isOwnMessage(msg) && isGroupChat">
                {{ getSenderName(msg.senderId) }}
              </div>
              <div class="content">
                {{ getMessageText(msg.content) }}
                <div *ngIf="isQuizLink(msg.content)" class="quiz-action-link">
                  <button type="button" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors quiz-btn" (click)="goToQuiz(msg.content)">
                    <ng-icon name="lucideClipboardList"></ng-icon>
                    COMMENCER LE QUIZ
                  </button>
                </div>
              </div>
              <div class="time">{{ (msg.sentAt | date:'HH:mm') || 'Maintenant' }}</div>
            </div>

          </div>

          <div *ngIf="messages.length === 0" class="empty-chat">
            <ng-icon name="lucideHand"></ng-icon>
            <p>Soyez le premier à envoyer un message !</p>
          </div>
        </div>

        <!-- Input -->
        <div class="message-input-area">
          <div class="input-wrapper">
            <input 
              [(ngModel)]="newMessage"
              placeholder="Écrire un message..."
              (keyup.enter)="sendMessage()"
              [disabled]="!isConnected"
              class="custom-input" />
            <button type="button" class="bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed send-btn"
              [disabled]="!newMessage.trim() || !isConnected"
              (click)="sendMessage()">
              <ng-icon name="lucideSend" size="18"></ng-icon>
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .chat-container { 
      max-width: 900px; margin: 40px auto; padding: 0 16px; 
      height: calc(100vh - 120px); min-height: 500px;
    }
    .chat-wrapper {
      display: flex; flex-direction: column; height: 100%;
      background: white; border-radius: 20px; border: 1px solid rgba(0,0,0,0.05); overflow: hidden;
    }
    
    .chat-header {
      display: flex; align-items: center; gap: 16px;
      padding: 16px 24px; background: rgba(255,255,255,0.9);
      backdrop-filter: blur(8px); border-bottom: 1px solid var(--co-background);
      z-index: 10; box-shadow: 0 2px 10px rgba(0,0,0,0.02);
    }
    .back-btn { color: var(--co-text-muted); }
    
    .chat-title-info { display: flex; align-items: center; gap: 12px; }
    .header-spacer { flex: 1; }
    .avatar-mini { width: 40px; height: 40px; border-radius: 50%; background: var(--co-primary-light); color: var(--co-primary); display: flex; justify-content: center; align-items: center; }
    .avatar-mini ng-icon { font-size: 20px; width: 20px; height: 20px; }
    .title-texts { display: flex; flex-direction: column; }
    .chat-name { font-weight: 700; font-size: 16px; color: var(--co-secondary); }
    
    .connection-status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--co-text-muted); margin-top: 2px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--co-text-muted); }
    .connection-status.connected .status-dot { background: var(--co-success); }
    .connection-status.connected { color: var(--co-success); }
    
    .messages-area {
      flex: 1; overflow-y: auto; padding: 24px;
      background: #F8FAFC; display: flex; flex-direction: column; gap: 12px;
    }
    
    .message { display: flex; flex-direction: column; max-width: 75%; }
    .message:not(.own):not(.system) { align-self: flex-start; }
    .message.own { align-self: flex-end; }
    .message.system { align-self: center; max-width: 100%; margin: 16px 0; }
    
    .system-msg { color: var(--co-text-muted); font-size: 12px; font-weight: 500; background: rgba(0,0,0,0.04); padding: 4px 16px; border-radius: 20px; }
    
    .message-bubble { 
      padding: 12px 16px; border-radius: 16px; 
      background: white; box-shadow: var(--shadow-sm); border: 1px solid rgba(0,0,0,0.03); 
      position: relative;
    }
    .message:not(.own) .message-bubble { border-bottom-left-radius: 4px; }
    .message.own .message-bubble { 
      background: var(--co-primary); color: white; border: none;
      border-bottom-right-radius: 4px;
    }
    
    .sender { font-size: 12px; font-weight: 700; color: var(--co-primary); margin-bottom: 4px; }
    .message.own .sender { display: none; }
    
    .content { font-size: 15px; line-height: 1.5; word-break: break-word; }
    
    .quiz-action-link { margin-top: 12px; display: flex; }
    .quiz-btn { border-radius: 12px; font-weight: 700; letter-spacing: 0.5px; }
    .quiz-btn ng-icon { margin-right: 8px; }
    
    .time { font-size: 11px; margin-top: 6px; text-align: right; color: #94A3B8; }
    .message.own .time { color: rgba(255,255,255,0.7); }
    
    .empty-chat { text-align: center; color: var(--co-text-muted); padding: 60px; margin: auto; }
    .empty-chat ng-icon { font-size: 48px; width: 48px; height: 48px; color: #CBD5E1; margin-bottom: 16px; }
    
    .message-input-area {
      padding: 16px 24px; background: white;
      border-top: 1px solid var(--co-background);
    }
    .input-wrapper { 
      display: flex; align-items: center; gap: 12px; 
      background: #F1F5F9; border-radius: 24px; padding: 6px 6px 6px 16px; 
      border: 1px solid transparent; transition: var(--transition-fast);
    }
    .input-wrapper:focus-within { border-color: var(--co-primary); background: white; box-shadow: 0 0 0 4px var(--co-primary-light); }
    
    .custom-input { 
      flex: 1; border: none; background: transparent; outline: none; 
      font-size: 15px; padding: 8px 0; color: var(--co-text-main); font-family: inherit;
    }
    .custom-input::placeholder { color: #94A3B8; }
    
    .send-btn { box-shadow: none !important; width: 36px; height: 36px; display: flex; justify-content: center; align-items: center; }

    /* Invitation Banner */
    .invitation-banner {
      background: #F0F9FF; border-bottom: 1px solid #BAE6FD;
      padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px;
    }
    .banner-content { display: flex; align-items: center; gap: 12px; }
    .banner-icon { color: var(--co-primary); font-size: 24px; width: 24px; height: 24px; }
    .banner-icon ng-icon { font-size: 24px; width: 24px; height: 24px; }
    .banner-text { display: flex; flex-direction: column; }
    .banner-text strong { font-size: 14px; color: var(--co-secondary); }
    .banner-text span { font-size: 13px; color: var(--co-text-muted); }
    .banner-actions { display: flex; gap: 12px; }

    @media (max-width: 600px) {
      .invitation-banner { flex-direction: column; align-items: stretch; gap: 12px; }
    }
  `]
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  isConnected = false;
  isGroupChat = false;
  isInvitation = false;
  groupId = '';
  targetUserId = '';
  currentUserId = '';

  private senderNames = new Map<string, string>();
  private connSub: Subscription | null = null;
  private autoScroll = true; // flag to scroll exactly once per newly added item

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private userProfileService: UserProfileService
  ) {}

  isQuizLink(content: string): boolean {
    return !!content && content.includes('/community/marketplace/quiz/');
  }

  getMessageText(content: string): string {
    if (!content) return '';
    // If it's a quiz link, return the text before the link
    if (this.isQuizLink(content)) {
      return content.split(' : ')[0] + ' :';
    }
    return content;
  }

  goToQuiz(content: string) {
    const urlMatch = content.match(/\/community\/marketplace\/quiz\/[a-zA-Z0-9]+/);
    if (urlMatch) {
      this.router.navigateByUrl(urlMatch[0]);
    }
  }

  ngOnInit() {
    this.currentUserId = this.authService.getUserId()?.toString() || '';
    
    // Resolve user IDs to names for view display
    this.userProfileService.loadDirectory().subscribe(users =>
      users.forEach(u => this.senderNames.set(String(u.id), this.userProfileService.displayNameFromUser(u)))
    );
    
    this.groupId = this.route.snapshot.paramMap.get('groupId') || '';
    this.targetUserId = this.route.snapshot.paramMap.get('userId') || '';
    this.isGroupChat = !!this.groupId;

    // Listen to connection status updates
    this.connSub = this.chatService.isConnected$.subscribe(status => {
      this.isConnected = status;
    });

    // 1. Load history THEN 2. Connect WebSocket
    this.loadHistory();
  }

  loadHistory() {
    if (this.isGroupChat) {
      this.chatService.getGroupHistory(this.groupId).subscribe(msgs => {
        this.messages = msgs;
        this.autoScroll = true;
        this.connectAndSubscribe();
      });
    } else {
      this.chatService.getPrivateHistory(this.currentUserId, this.targetUserId).subscribe(msgs => {
        this.messages = msgs;
        // Check if there's an active invitation from the partner
        this.isInvitation = msgs.some(m => m.type === 'INVITATION' && m.receiverId === this.currentUserId);
        this.autoScroll = true;
        this.connectAndSubscribe();
        
        // Mark all messages from partner as read
        this.chatService.markConversationAsRead(this.currentUserId, this.targetUserId).subscribe();
      });
    }
  }

  connectAndSubscribe() {
    this.chatService.connect(this.currentUserId, () => {
      if (this.isGroupChat) {
        this.chatService.subscribeToGroup(this.groupId, (msg) => {
          this.handleIncomingMessage(msg);
        });
        this.chatService.joinGroup(this.groupId, this.currentUserId);
      } else {
        this.chatService.subscribeToPrivate(this.currentUserId, (msg) => {
          this.handleIncomingMessage(msg);
        });
      }
    });
  }

  handleIncomingMessage(msg: ChatMessage) {
    // Check if message belongs in this conversation view context
    if (!this.isGroupChat) {
      if (
        (msg.senderId !== this.targetUserId && msg.senderId !== this.currentUserId) ||
        (msg.senderId === this.currentUserId && msg.receiverId !== this.targetUserId) 
      ) {
        return; // Message is for another concurrent private chat window
      }
    }
    
    this.messages.push(msg); // Append rather than replace array
    this.autoScroll = true;

    // If message is from partner and window is open, mark it as read immediately
    if (!this.isGroupChat && msg.senderId === this.targetUserId && msg.id) {
      this.chatService.markAsRead(msg.id).subscribe();
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    // Locally inject optimistic update to the array BEFORE processing roundtrip 
    // Wait, the new spec says "Show messages correctly (blue vs white)", let's rely on STOMP roundtrip 
    // or just assume we send directly via service. Local optimism is not strictly mandated but good UX.
    // The user simply requested: "show messages correctly: own on right, others on left" which CSS handles.
    // Since STOMP echoes it (or we can inject it optimistic):
    const message: ChatMessage = {
      senderId: this.currentUserId,
      content: this.newMessage,
      type: this.isGroupChat ? 'CHAT' : 'PRIVATE',
      read: false,
      groupId: this.isGroupChat ? this.groupId : undefined,
      receiverId: !this.isGroupChat ? this.targetUserId : undefined
    };

    if (this.isGroupChat) {
      this.chatService.sendGroupMessage(this.groupId, message);
    } else {
      this.chatService.sendPrivateMessage(message);
      // For private messages without optimistic echo on backend, we can optionally push it
      // if using full direct convertAndSendToUser receiver only.
      // Assuming backend reflects it via standard mechanisms via subscribeToPrivate or optimistic:
      this.handleIncomingMessage({ ...message, sentAt: new Date().toISOString() } as unknown as ChatMessage);
      
      // If we reply, we implicitly accept the invitation (Messenger logic)
      if (this.isInvitation) {
        this.acceptInvitation();
      }
    }

    this.newMessage = '';
  }

  acceptInvitation() {
    this.chatService.acceptInvitation(this.currentUserId, this.targetUserId).subscribe({
      next: () => {
        this.isInvitation = false;
        // Update local message types 
        this.messages.forEach(m => {
          if (m.type === 'INVITATION') m.type = 'PRIVATE';
        });
      },
      error: (err) => console.error('Erreur lors de l\'acceptation de l\'invitation', err)
    });
  }

  ngAfterViewChecked() {
    if (this.autoScroll) {
      this.scrollToBottom();
      this.autoScroll = false;
    }
  }

  private scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch {}
  }

  ngOnDestroy() {
    this.chatService.disconnect();
    this.connSub?.unsubscribe();
  }

  getSenderName(senderId: string): string {
    if (!senderId) return 'Inconnu';
    return this.senderNames.get(String(senderId)) || `Utilisateur ${senderId}`;
  }

  isOwnMessage(msg: ChatMessage): boolean {
    return String(msg.senderId) === String(this.currentUserId);
  }

  deleteConversation() {
    if (confirm('Voulez-vous vraiment supprimer cette conversation et tout son historique ?')) {
      this.chatService.deletePrivateConversation(this.currentUserId, this.targetUserId).subscribe({
        next: () => {
          this.messages = [];
          // Optionnel : rediriger vers la liste des conversations
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la conversation', err);
          alert('Impossible de supprimer la conversation.');
        }
      });
    }
  }
}