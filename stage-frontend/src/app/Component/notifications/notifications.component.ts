import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div *ngFor="let msg of messages" class="notification">
        {{ msg }}
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
    }
    .notification {
      background: #0d6efd;
      color: white;
      padding: 0.5rem 1rem;
      margin-bottom: 0.5rem;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
  `]
})
export class NotificationsComponent {
  @Input() messages: string[] = [];
}
