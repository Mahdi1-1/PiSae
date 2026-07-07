import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { CommunityNotification } from '../models/notification.model';
import { ChatService } from '../../messaging/services/chat.service';
import { ToastService } from '../../../../services/toast.service';


@Injectable({ providedIn: 'root' })
export class CommunityNotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  private notificationsSubject = new BehaviorSubject<CommunityNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private readonly toastService = inject(ToastService);

  constructor(
    private http: HttpClient,
    private chatService: ChatService
  ) {}

  init(userId: string) {
    this.refreshNotifications(userId);
    
    // Subscribe to notifications topic via the existing STOMP client in ChatService
    this.chatService.isConnected$.subscribe(connected => {
      if (connected) {
        this.subscribeToNotifications(userId);
      }
    });
  }

  private subscribeToNotifications(userId: string) {
    this.chatService.subscribeToNotifications(userId, (notification: CommunityNotification) => {
      this.handleNewNotification(notification);
    });
  }

  private handleNewNotification(notification: CommunityNotification) {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
    
    // Show Premium Toast
    this.toastService.show(notification.message, 'info');
  }

  refreshNotifications(userId: string) {
    this.getNotifications(userId).subscribe();
    this.getUnreadCount(userId).subscribe();
  }

  getNotifications(userId: string): Observable<CommunityNotification[]> {
    return this.http.get<CommunityNotification[]>(`${this.apiUrl}/${userId}`).pipe(
      tap(notifs => this.notificationsSubject.next(notifs))
    );
  }

  getUnreadCount(userId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${userId}/unread-count`).pipe(
      tap(count => this.unreadCountSubject.next(count))
    );
  }

  markAsRead(id: string, userId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => this.refreshNotifications(userId))
    );
  }

  markAllAsRead(userId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/all/${userId}/read`, {}).pipe(
      tap(() => this.refreshNotifications(userId))
    );
  }
}
