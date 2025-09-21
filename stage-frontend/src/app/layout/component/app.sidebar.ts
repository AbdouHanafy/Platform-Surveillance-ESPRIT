import { Component, ElementRef } from '@angular/core';
import { AppMenu } from './app.menu';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu],
    template: ` 
    <div class="layout-sidebar">
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <i class="pi pi-th-large"></i>
                <span>Menu</span>
            </div>
        </div>
        <div class="sidebar-content">
            <app-menu></app-menu>
        </div>
        <div class="sidebar-footer">
            <div class="user-info">
                <i class="pi pi-user"></i>
                <span>{{ getUserRole() }}</span>
            </div>
        </div>
    </div>`,
    styles: [`
        .layout-sidebar {
            position: fixed;
            width: 280px;
            height: calc(100vh - 4rem);
            z-index: 999;
            overflow: hidden;
            user-select: none;
            top: 4rem;
            left: 0;
            transition: all 0.3s ease;
            background: linear-gradient(135deg, var(--surface-card) 0%, var(--surface-section) 100%);
            border-right: 3px solid var(--primary-color);
            box-shadow: 
                0 8px 32px color-mix(in srgb, var(--primary-color) 15%, transparent),
                inset 0 1px 0 color-mix(in srgb, var(--primary-color) 10%, transparent);
            display: flex;
            flex-direction: column;
        }

        .sidebar-header {
            padding: 1.5rem 1.25rem 1rem;
            border-bottom: 2px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
            background: linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 80%, transparent) 100%);
            position: relative;
        }

        .sidebar-header::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, var(--primary-color) 50%, transparent 100%);
        }

        .sidebar-logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: white;
            font-weight: 700;
            font-size: 1.25rem;
        }

        .sidebar-logo i {
            font-size: 1.5rem;
            background: rgba(255, 255, 255, 0.2);
            padding: 0.5rem;
            border-radius: 8px;
            backdrop-filter: blur(10px);
        }

        .sidebar-content {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem 0;
            position: relative;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-color) transparent;
        }

        .sidebar-content::before {
            content: '';
            position: absolute;
            top: 0;
            left: 1.25rem;
            right: 1.25rem;
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, var(--primary-color) 20%, var(--primary-color) 80%, transparent 100%);
            box-shadow: 0 1px 3px color-mix(in srgb, var(--primary-color) 30%, transparent);
        }

        .sidebar-content::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 1.25rem;
            right: 1.25rem;
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, var(--primary-color) 20%, var(--primary-color) 80%, transparent 100%);
            box-shadow: 0 -1px 3px color-mix(in srgb, var(--primary-color) 30%, transparent);
        }

        .sidebar-footer {
            padding: 1rem 1.25rem 1.5rem;
            border-top: 2px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
            background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 5%, transparent) 0%, var(--surface-card) 100%);
            position: relative;
        }

        .sidebar-footer::before {
            content: '';
            position: absolute;
            top: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, var(--primary-color) 50%, transparent 100%);
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: var(--text-color);
            font-weight: 600;
            font-size: 0.9rem;
            padding: 0.75rem;
            background: color-mix(in srgb, var(--primary-color) 8%, transparent);
            border-radius: 8px;
            border: 1px solid color-mix(in srgb, var(--primary-color) 15%, transparent);
        }

        .user-info i {
            color: var(--primary-color);
            font-size: 1.1rem;
        }

        /* Scrollbar styling */
        .sidebar-content::-webkit-scrollbar {
            width: 8px;
        }

        .sidebar-content::-webkit-scrollbar-track {
            background: color-mix(in srgb, var(--primary-color) 8%, transparent);
            border-radius: 4px;
            margin: 4px 0;
        }

        .sidebar-content::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 80%, transparent) 100%);
            border-radius: 4px;
            border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        }

        .sidebar-content::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color) 90%, transparent) 0%, var(--primary-color) 100%);
            box-shadow: 0 0 8px color-mix(in srgb, var(--primary-color) 40%, transparent);
        }

        .sidebar-content::-webkit-scrollbar-corner {
            background: transparent;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            .layout-sidebar {
                width: 260px;
                transform: translateX(-100%);
            }

            .layout-sidebar.active {
                transform: translateX(0);
            }
        }
    `]
})
export class AppSidebar {
    constructor(public el: ElementRef) {}

    getUserRole(): string {
        const role = localStorage.getItem('role');
        switch (role) {
            case 'SUPER_ADMIN':
                return 'Super Admin';
            case 'ADMIN':
                return 'Admin';
            case 'ENSEIGNANT':
                return 'Enseignant';
            default:
                return 'Utilisateur';
        }
    }
}
