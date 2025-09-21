import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private stompClient!: Client;
  private notificationSubject = new Subject<string>();
  public notifications$ = this.notificationSubject.asObservable();

  constructor(private http: HttpClient) {}

  connect(enseignantId: number) {
    // Disconnect existing connection if any
    if (this.stompClient) {
      this.stompClient.deactivate();
    }

    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8090/ws', // WebSocket natif
      reconnectDelay: 5000,
      debug: (str) => console.log('WebSocket Debug:', str),
      connectHeaders: {
        'id': enseignantId.toString() // Send enseignant ID in headers
      }
    });

    this.stompClient.onConnect = () => {
      console.log('WebSocket connected successfully for enseignant ID:', enseignantId);
      
      // Subscribe to user-specific notifications (this is the main one for individual notifications)
      this.stompClient.subscribe(
        `/user/${enseignantId}/queue/notifications`,
        (msg: IMessage) => {
          console.log('Received user-specific notification:', msg.body);
          this.notificationSubject.next(msg.body);
        }
      );

      // Subscribe to general topic notifications (for broadcast messages)
      this.stompClient.subscribe('/topic/notifications', (msg: IMessage) => {
        console.log('Received broadcast notification:', msg.body);
        this.notificationSubject.next(msg.body);
      });

      // Subscribe to enseignant-specific topic (alternative way)
      this.stompClient.subscribe(`/topic/enseignant/${enseignantId}`, (msg: IMessage) => {
        console.log('Received enseignant-specific notification:', msg.body);
        this.notificationSubject.next(msg.body);
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
      console.log('WebSocket disconnected');
    }
  }

  // Send notification to specific enseignants
  sendNotificationToEnseignants(enseignantIds: number[], message: string): Observable<any> {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('WebSocket not connected, sending via HTTP fallback');
      return this.sendNotificationViaHttp(enseignantIds, message);
    }

    try {
      // Send to each enseignant individually using the same method as backend
      enseignantIds.forEach(enseignantId => {
        // This simulates what the backend does when creating an exam
        // The backend uses messagingTemplate.convertAndSendToUser()
        // We'll use the general topic for now since we can't directly call the backend method
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

      console.log(`Exam creation notification sent to ${enseignantIds.length} enseignants via WebSocket`);
      return of({ success: true, message: 'Exam creation notifications sent via WebSocket' });
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
}
