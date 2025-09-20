import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalNotificationService, NotificationMessage } from '../../Service/global-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-global-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Notification Bell Icon with Badge -->
    <div class="notification-bell" (click)="toggleDropdown()">
      <i class="pi pi-bell"></i>
      <span *ngIf="unreadCount > 0" class="notification-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </div>

    <!-- Notification Dropdown -->
    <div class="notification-dropdown" [class.show]="showDropdown">
      <div class="notification-header">
        <h3>Notifications</h3>
        <div class="notification-actions">
          <button (click)="markAllAsRead()" class="btn-mark-all">
            <i class="pi pi-check"></i>
          </button>
          <button (click)="clearAll()" class="btn-clear-all">
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>

      <div class="notification-list">
        <div *ngIf="notifications.length === 0" class="no-notifications">
          <i class="pi pi-bell-slash"></i>
          <p>Aucune notification</p>
        </div>

        <div 
          *ngFor="let notification of notifications" 
          class="notification-item"
          [class.unread]="!notification.isRead"
          [class]="'notification-' + notification.type"
          (click)="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            <i [class]="getIconForType(notification.type)"></i>
          </div>
          <div class="notification-content">
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ getTimeAgo(notification.timestamp) }}</div>
          </div>
          <div class="notification-actions">
            <button (click)="removeNotification(notification.id); $event.stopPropagation()" class="btn-remove">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <div 
        *ngFor="let toast of toastNotifications" 
        class="toast-notification"
        [class]="'toast-' + toast.type"
        [@slideIn]
      >
        <div class="toast-icon">
          <i [class]="getIconForType(toast.type)"></i>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button (click)="removeToast(toast.id)" class="toast-close">
          <i class="pi pi-times"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-bell {
      position: relative;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background-color 0.3s;
    }

    .notification-bell:hover {
      background-color: var(--bg-hover);
    }

    .notification-bell i {
      font-size: 1.2rem;
      color: var(--primary-color);
    }

    .notification-badge {
      position: absolute;
      top: 0;
      right: 0;
      background-color: var(--primary-color);
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 0.7rem;
      font-weight: bold;
      min-width: 18px;
      text-align: center;
    }

    .notification-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 350px;
      max-height: 400px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    }

    .notification-dropdown.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .notification-actions {
      display: flex;
      gap: 8px;
    }

    .btn-mark-all, .btn-clear-all {
      background: none;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-mark-all:hover {
      background-color: #e3f2fd;
    }

    .btn-clear-all:hover {
      background-color: #ffebee;
    }

    .notification-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .no-notifications {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .no-notifications i {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 15px 20px;
      border-bottom: 1px solid #f5f5f5;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .notification-item:hover {
      background-color: #f8f9fa;
    }

    .notification-item.unread {
      background-color: #e3f2fd;
    }

    .notification-item.unread:hover {
      background-color: #bbdefb;
    }

    .notification-icon {
      margin-right: 12px;
      margin-top: 2px;
    }

    .notification-icon i {
      font-size: 1rem;
    }

    .notification-info .notification-icon i {
      color: #2196f3;
    }

    .notification-success .notification-icon i {
      color: #4caf50;
    }

    .notification-warning .notification-icon i {
      color: #ff9800;
    }

    .notification-error .notification-icon i {
      color: #f44336;
    }

    .notification-content {
      flex: 1;
    }

    .notification-message {
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 4px;
    }

    .notification-time {
      font-size: 0.8rem;
      color: #666;
    }

    .btn-remove {
      background: none;
      border: none;
      padding: 4px;
      border-radius: 50%;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.3s;
    }

    .btn-remove:hover {
      opacity: 1;
      background-color: #ffebee;
    }

    /* Toast Notifications */
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
    }

    .toast-notification {
      display: flex;
      align-items: center;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 15px 20px;
      margin-bottom: 10px;
      min-width: 300px;
      max-width: 400px;
      animation: slideInRight 0.3s ease;
    }

    .toast-info {
      border-left: 4px solid #2196f3;
    }

    .toast-success {
      border-left: 4px solid #4caf50;
    }

    .toast-warning {
      border-left: 4px solid #ff9800;
    }

    .toast-error {
      border-left: 4px solid #f44336;
    }

    .toast-icon {
      margin-right: 12px;
    }

    .toast-icon i {
      font-size: 1.2rem;
    }

    .toast-info .toast-icon i {
      color: #2196f3;
    }

    .toast-success .toast-icon i {
      color: #4caf50;
    }

    .toast-warning .toast-icon i {
      color: #ff9800;
    }

    .toast-error .toast-icon i {
      color: #f44336;
    }

    .toast-message {
      flex: 1;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      padding: 4px;
      border-radius: 50%;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.3s;
      margin-left: 8px;
    }

    .toast-close:hover {
      opacity: 1;
      background-color: #f5f5f5;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class GlobalNotificationsComponent implements OnInit, OnDestroy {
  notifications: NotificationMessage[] = [];
  toastNotifications: NotificationMessage[] = [];
  showDropdown = false;
  unreadCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(private globalNotificationService: GlobalNotificationService) {}

  ngOnInit() {
    // Subscribe to notifications list
    this.subscriptions.push(
      this.globalNotificationService.notificationsList$.subscribe(notifications => {
        this.notifications = notifications;
        this.updateUnreadCount();
      })
    );

    // Subscribe to new notifications for toast
    this.subscriptions.push(
      this.globalNotificationService.notifications$.subscribe(notification => {
        this.showToast(notification);
      })
    );

    // Connect to WebSocket if user is logged in
    const enseignantId = Number(localStorage.getItem('id'));
    if (enseignantId) {
      this.globalNotificationService.connect(enseignantId);
      // Reload notifications for this specific user
      this.globalNotificationService.loadNotificationsFromStorage();
    }

    // Add click outside handler to close dropdown
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  private handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-bell') && !target.closest('.notification-dropdown')) {
      this.showDropdown = false;
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  markAsRead(notificationId: string) {
    this.globalNotificationService.markAsRead(notificationId);
  }

  markAllAsRead() {
    this.globalNotificationService.markAllAsRead();
  }

  clearAll() {
    this.globalNotificationService.clearAllNotifications();
  }

  removeNotification(notificationId: string) {
    // This would need to be implemented in the service
    // For now, we'll just mark it as read
    this.markAsRead(notificationId);
  }

  showToast(notification: NotificationMessage) {
    this.toastNotifications.push(notification);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      this.removeToast(notification.id);
    }, 5000);
  }

  removeToast(notificationId: string) {
    this.toastNotifications = this.toastNotifications.filter(t => t.id !== notificationId);
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'error':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-info-circle';
    }
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
      return `${days} jour${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
  }
}
