import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../../../environments/environment';
import { ChatMessage } from '../../shared/models/chat-message.model';

@Injectable({ providedIn: 'root' })
export class ChatService {

  private apiUrl = `${environment.apiUrl}/messages`;
  private stompClient: Client | null = null;
  
  // Keep subscriptions so we can unsubscribe on room change
  private activeSubscriptions: Map<string, StompSubscription> = new Map();

  // Real-time incoming messages
  private incomingMessageSubject = new Subject<ChatMessage>();
  public incomingMessage$ = this.incomingMessageSubject.asObservable();
  
  // Connection state
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.connectedSubject.asObservable();

  // Unread messages state
  private unreadMessagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public unreadMessages$ = this.unreadMessagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ── WebSocket Lifecycle ────────────────────────

  connect(userId: string, onConnected: () => void) {
    if (this.stompClient && this.stompClient.connected) {
      onConnected();
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP: Connected to WebSocket');
        this.connectedSubject.next(true);
        onConnected();
      },
      onDisconnect: () => {
        console.warn('STOMP: Disconnected');
        this.connectedSubject.next(false);
      },
      onStompError: (error) => {
        console.error('STOMP: Error', error);
      }
    });

    this.stompClient.activate();
  }

  disconnect() {
    this.unsubscribeAll();
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.connectedSubject.next(false);
  }

  private unsubscribeAll() {
    this.activeSubscriptions.forEach(sub => sub.unsubscribe());
    this.activeSubscriptions.clear();
  }

  private unsubscribe(key: string) {
    const sub = this.activeSubscriptions.get(key);
    if (sub) {
      sub.unsubscribe();
      this.activeSubscriptions.delete(key);
    }
  }

  // ── Subscriptions ───────────────────────────────

  subscribeToGroup(groupId: string, onMessage: (msg: ChatMessage) => void) {
    if (!this.stompClient || !this.stompClient.connected) return;
    
    const topic = `/topic/group/${groupId}`;
    if (this.activeSubscriptions.has(topic)) return;

    const sub = this.stompClient.subscribe(
      topic,
      (message: IMessage) => {
        const msg: ChatMessage = JSON.parse(message.body);
        this.incomingMessageSubject.next(msg);
        onMessage(msg);
      }
    );
    this.activeSubscriptions.set(topic, sub);
  }

  subscribeToPrivate(userId: string, onMessage: (msg: ChatMessage) => void) {
    if (!this.stompClient || !this.stompClient.connected) return;
    
    const topic = `/topic/user/${userId}`;
    if (this.activeSubscriptions.has(topic)) return;

    const sub = this.stompClient.subscribe(
      topic,
      (message: IMessage) => {
        const msg: ChatMessage = JSON.parse(message.body);
        this.incomingMessageSubject.next(msg);
        
        // If it's a private message or invitation for the current user, refresh unread status
        if (msg.receiverId === userId) {
          this.refreshUnreadStatus(userId);
        }
        
        onMessage(msg);
      }
    );
    this.activeSubscriptions.set(topic, sub);
  }

  subscribeToNotifications(userId: string, onNotification: (notif: any) => void) {
    if (!this.stompClient || !this.stompClient.connected) return;
    
    const topic = `/topic/notifications/${userId}`;
    if (this.activeSubscriptions.has(topic)) return;

    const sub = this.stompClient.subscribe(
      topic,
      (message: IMessage) => {
        const notif = JSON.parse(message.body);
        onNotification(notif);
      }
    );
    this.activeSubscriptions.set(topic, sub);
  }

  // ── Messaging ──────────────────────────────────

  sendGroupMessage(groupId: string, message: ChatMessage) {
    if (!this.stompClient || !this.stompClient.connected) return;
    this.stompClient.publish({
      destination: `/app/chat.group/${groupId}`,
      body: JSON.stringify(message)
    });
  }

  sendPrivateMessage(message: ChatMessage) {
    if (!this.stompClient || !this.stompClient.connected) return;
    this.stompClient.publish({
      destination: '/app/chat.private',
      body: JSON.stringify(message)
    });
  }

  joinGroup(groupId: string, userId: string) {
    if (!this.stompClient || !this.stompClient.connected) return;
    this.stompClient.publish({
      destination: `/app/chat.join/${groupId}`,
      body: JSON.stringify({ senderId: userId, groupId, type: 'JOIN', read: false, content: '' })
    });
  }

  // ── REST History APIs ──────────────────────────

  getGroupHistory(groupId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/group/${groupId}`);
  }

  getPrivateHistory(senderId: string, receiverId: string): Observable<ChatMessage[]> {
    const params = new HttpParams()
      .set('senderId', senderId)
      .set('receiverId', receiverId);
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/private`, { params });
  }

  getUnreadMessages(memberId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/unread/${memberId}`).pipe(
      tap(msgs => this.unreadMessagesSubject.next(msgs))
    );
  }

  getConversations(userId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/conversations/${userId}`);
  }

  refreshUnreadStatus(memberId: string) {
    this.getUnreadMessages(memberId).subscribe();
  }

  markAsRead(messageId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${messageId}/read`, {}).pipe(
      tap(() => {
        // Optimistically remove from local unread list if possible, 
        // but a full refresh is safer for accuracy
        const current = this.unreadMessagesSubject.value;
        const userId = current.length > 0 ? (current[0].receiverId || '') : '';
        if (userId) this.refreshUnreadStatus(userId);
      })
    );
  }

  markConversationAsRead(userId: string, partnerId: string): Observable<void> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('partnerId', partnerId);
    return this.http.put<void>(`${this.apiUrl}/read/all`, {}, { params }).pipe(
      tap(() => this.refreshUnreadStatus(userId))
    );
  }

  deletePrivateConversation(userId1: string, userId2: string): Observable<void> {
    const params = new HttpParams()
      .set('userId1', userId1)
      .set('userId2', userId2);
    return this.http.delete<void>(`${this.apiUrl}/private`, { params });
  }

  getInvitations(memberId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/invitations/${memberId}`);
  }

  acceptInvitation(userId: string, partnerId: string): Observable<void> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('partnerId', partnerId);
    return this.http.post<void>(`${this.apiUrl}/invitations/accept`, {}, { params });
  }
}