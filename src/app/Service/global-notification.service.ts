import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject, Observable, of, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface NotificationMessage {
  id: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalNotificationService {
  private stompClient!: Client;
  private notificationSubject = new Subject<NotificationMessage>();
  private notificationsList = new BehaviorSubject<NotificationMessage[]>([]);
  
  public notifications$ = this.notificationSubject.asObservable();
  public notificationsList$ = this.notificationsList.asObservable();

  constructor(private http: HttpClient) {
    // Load notifications from localStorage on initialization
    this.loadNotificationsFromStorage();
  }

  connect(enseignantId: number) {
    // Disconnect existing connection if any
    if (this.stompClient) {
      this.stompClient.deactivate();
    }

    this.stompClient = new Client({
      brokerURL: `ws://localhost:8090/ws?id=${enseignantId}`,
      reconnectDelay: 5000,
      debug: (str) => console.log('WebSocket Debug:', str)
    });

    this.stompClient.onConnect = () => {
      console.log('Global WebSocket connected successfully for enseignant ID:', enseignantId);
      
      // Subscribe to user-specific notifications
      this.stompClient.subscribe(
        `/user/${enseignantId}/queue/notifications`,
        (msg: IMessage) => {
          console.log('Received user-specific notification:', msg.body);
          this.addNotification(msg.body, 'info');
        }
      );

      // Subscribe to general topic notifications
      this.stompClient.subscribe('/topic/notifications', (msg: IMessage) => {
        console.log('Received broadcast notification:', msg.body);
        this.addNotification(msg.body, 'info');
      });

      // Subscribe to enseignant-specific topic
      this.stompClient.subscribe(`/topic/enseignant/${enseignantId}`, (msg: IMessage) => {
        console.log('Received enseignant-specific notification:', msg.body);
        this.addNotification(msg.body, 'success');
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('WebSocket STOMP error:', frame);
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
    };

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('Global WebSocket disconnected');
    }
  }

  // Add a new notification to the list
  addNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const notification: NotificationMessage = {
      id: Date.now().toString(),
      message: message,
      timestamp: new Date(),
      type: type,
      isRead: false
    };

    // Add to the list
    const currentNotifications = this.notificationsList.value;
    const updatedNotifications = [notification, ...currentNotifications].slice(0, 50); // Keep last 50
    this.notificationsList.next(updatedNotifications);

    // Save to localStorage
    this.saveNotificationsToStorage(updatedNotifications);

    // Emit the new notification
    this.notificationSubject.next(notification);
  }



  // Get unread count
  getUnreadCount(): Observable<number> {
    return new Observable(observer => {
      this.notificationsList$.subscribe(notifications => {
        const unreadCount = notifications.filter(n => !n.isRead).length;
        observer.next(unreadCount);
      });
    });
  }

  // Send notification to specific enseignants
  sendNotificationToEnseignants(enseignantIds: number[], message: string): Observable<any> {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('WebSocket not connected, sending via HTTP fallback');
      return this.sendNotificationViaHttp(enseignantIds, message);
    }

    try {
      enseignantIds.forEach(enseignantId => {
        this.stompClient.publish({
          destination: `/app/send-notification`,
          body: JSON.stringify({
            enseignantId: enseignantId,
            message: message,
            timestamp: new Date().toISOString(),
            type: 'exam_creation'
          })
        });
      });

      console.log(`Global notification sent to ${enseignantIds.length} enseignants via WebSocket`);
      return of({ success: true, message: 'Notifications sent via WebSocket' });
    } catch (error) {
      console.error('Error sending WebSocket notification:', error);
      return this.sendNotificationViaHttp(enseignantIds, message);
    }
  }

  // HTTP fallback for sending notifications
  private sendNotificationViaHttp(enseignantIds: number[], message: string): Observable<any> {
    const payload = {
      enseignantIds: enseignantIds,
      message: message,
      timestamp: new Date().toISOString()
    };

    return this.http.post('http://localhost:8090/test-notif/batch', payload);
  }

  // Send a general notification
  sendGeneralNotification(message: string): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/send-notification',
        body: message
      });
      console.log('General notification sent:', message);
    } else {
      console.warn('WebSocket not connected, cannot send notification');
    }
  }

  // Test notification endpoint
  testNotification(enseignantId: number): Observable<any> {
    return this.http.get(`http://localhost:8090/test-notif/${enseignantId}`);
  }

  // Get connection status
  isConnected(): boolean {
    return this.stompClient ? this.stompClient.connected : false;
  }

  // Save notifications to localStorage
  private saveNotificationsToStorage(notifications: NotificationMessage[]): void {
    try {
      const enseignantId = this.getCurrentEnseignantId();
      if (enseignantId) {
        const key = `notifications_${enseignantId}`;
        localStorage.setItem(key, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }

  // Load notifications from localStorage
  public loadNotificationsFromStorage(): void {
    try {
      const enseignantId = this.getCurrentEnseignantId();
      if (enseignantId) {
        const key = `notifications_${enseignantId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const notifications = JSON.parse(stored).map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }));
          this.notificationsList.next(notifications);
        } else {
          this.notificationsList.next([]);
        }
      } else {
        this.notificationsList.next([]);
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
      this.notificationsList.next([]);
    }
  }

  // Get current enseignant ID from localStorage
  private getCurrentEnseignantId(): number | null {
    const id = localStorage.getItem('id');
    return id ? Number(id) : null;
  }

  // Clear all notifications and remove from localStorage
  clearAllNotifications() {
    this.notificationsList.next([]);
    const enseignantId = this.getCurrentEnseignantId();
    if (enseignantId) {
      const key = `notifications_${enseignantId}`;
      localStorage.removeItem(key);
    }
  }

  // Mark notification as read and save to localStorage
  markAsRead(notificationId: string) {
    const currentNotifications = this.notificationsList.value;
    const updatedNotifications = currentNotifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    );
    this.notificationsList.next(updatedNotifications);
    this.saveNotificationsToStorage(updatedNotifications);
  }

  // Mark all notifications as read and save to localStorage
  markAllAsRead() {
    const currentNotifications = this.notificationsList.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      isRead: true
    }));
    this.notificationsList.next(updatedNotifications);
    this.saveNotificationsToStorage(updatedNotifications);
  }
}
