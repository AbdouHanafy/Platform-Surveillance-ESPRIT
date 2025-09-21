import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `
    <ul class="layout-menu">
      <ng-container *ngFor="let item of model; let i = index">
        <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
        <li *ngIf="item.separator" class="menu-separator"></li>
      </ng-container>
    </ul>
  `,
  styles: [`
    .layout-menu {
      list-style: none;
      margin: 0;
      padding: 1rem 1.25rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: transparent;
      border-radius: 12px;
      width: 100%;
      position: relative;
    }

    .layout-menu::before {
      content: '';
      position: absolute;
      top: 0;
      left: 1.25rem;
      right: 1.25rem;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, var(--primary-color) 50%, transparent 100%);
      opacity: 0.3;
    }

    .layout-menu li {
      position: relative;
      margin-bottom: 0.25rem;
    }

    .layout-menu > li {
      background: var(--surface-card);
      border-radius: 12px;
      box-shadow: 0 2px 8px color-mix(in srgb, var(--primary-color) 8%, transparent);
      border: 1px solid color-mix(in srgb, var(--primary-color) 15%, transparent);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .layout-menu > li:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px color-mix(in srgb, var(--primary-color) 15%, transparent);
      border-color: var(--primary-color);
    }

    .layout-menu > li:not(:last-child) {
      margin-bottom: 1rem;
      position: relative;
    }

    .layout-menu > li:not(:last-child)::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--primary-color) 20%, transparent) 25%, color-mix(in srgb, var(--primary-color) 20%, transparent) 75%, transparent 100%);
      border-radius: 1px;
    }

    .menu-separator {
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, var(--primary-color) 30%, var(--primary-color) 70%, transparent 100%);
      margin: 1.5rem 0;
      opacity: 0.8;
      position: relative;
      border-radius: 1px;
      box-shadow: 0 1px 3px color-mix(in srgb, var(--primary-color) 20%, transparent);
    }

    .menu-separator::before {
      content: '';
      position: absolute;
      top: -3px;
      left: 50%;
      transform: translateX(-50%);
      width: 10px;
      height: 10px;
      background: var(--primary-color);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--primary-color);
      border: 2px solid var(--surface-card);
    }

    .menu-separator::after {
      content: '';
      position: absolute;
      top: -1px;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--primary-color) 40%, transparent) 50%, transparent 100%);
      border-radius: 1px;
    }

    .layout-menu > li > a,
    .layout-menu > li > div {
      display: flex;
      align-items: center;
      padding: 1rem 1.25rem;
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 0;
      user-select: none;
      position: relative;
      background: transparent;
    }

    .layout-menu > li > a::before,
    .layout-menu > li > div::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--primary-color);
      transform: scaleY(0);
      transition: transform 0.3s ease;
    }

    .layout-menu > li > a:hover,
    .layout-menu > li > div:hover {
      background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 10%, transparent) 0%, color-mix(in srgb, var(--primary-color) 5%, transparent) 100%);
      color: var(--primary-color);
      transform: translateX(4px);
    }

    .layout-menu > li > a:hover::before,
    .layout-menu > li > div:hover::before {
      transform: scaleY(1);
    }

    .layout-menu > li > a.active-route,
    .layout-menu > li > div.active-route {
      background: linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 90%, transparent) 100%);
      color: white;
      transform: translateX(4px);
    }

    .layout-menu > li > a.active-route::before,
    .layout-menu > li > div.active-route::before {
      transform: scaleY(1);
      background: white;
    }

    .layout-menu .pi {
      margin-right: 0.75rem;
      font-size: 1.1rem;
      width: 20px;
      text-align: center;
      transition: transform 0.3s ease;
    }

    .layout-menu > li > a:hover .pi,
    .layout-menu > li > div:hover .pi {
      transform: scale(1.1);
    }

    .layout-menu > li > a.active-route .pi,
    .layout-menu > li > div.active-route .pi {
      transform: scale(1.1);
    }

         /* Submenu styling */
     .layout-menu ul {
       background: color-mix(in srgb, var(--primary-color) 3%, transparent);
       border-radius: 8px;
       margin: 0.5rem 0;
       padding: 0.5rem;
       border-left: 3px solid var(--primary-color);
     }

     /* Special styling for Gestion des modules */
     .layout-menu > li.modules-section {
       background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
       border: 2px solid #dc2626;
       box-shadow: 0 4px 16px rgba(220, 38, 38, 0.3);
     }

     .layout-menu > li.modules-section .layout-menuitem-root-text {
       background: #dc2626;
       color: white;
       border: 2px solid #dc2626;
       text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
     }

     .layout-menu > li.modules-section .layout-menuitem-root-text::before,
     .layout-menu > li.modules-section .layout-menuitem-root-text::after {
       background: white;
       box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
     }

     .layout-menu > li.modules-section ul {
       background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
       border-left: 4px solid #dc2626;
       border-radius: 10px;
       box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
     }

     .layout-menu > li.modules-section ul a {
       color: #374151;
       font-weight: 600;
       border-radius: 8px;
       margin: 0.25rem 0;
       border: 1px solid transparent;
       transition: all 0.3s ease;
     }

     .layout-menu > li.modules-section ul a:hover {
       background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
       color: white;
       transform: translateX(6px);
       border-color: #dc2626;
       box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
     }

     .layout-menu > li.modules-section ul a.active-route {
       background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
       color: white;
       transform: translateX(6px);
       border-color: #dc2626;
       box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
     }

     .layout-menu > li.modules-section ul a .pi {
       color: inherit;
       background: rgba(255, 255, 255, 0.2);
       padding: 0.25rem;
       border-radius: 4px;
       margin-right: 0.5rem;
     }

     .layout-menu > li.modules-section ul a:hover .pi,
     .layout-menu > li.modules-section ul a.active-route .pi {
       background: rgba(255, 255, 255, 0.3);
       transform: scale(1.1);
     }

    .layout-menu ul li {
      margin-bottom: 0.25rem;
    }

    .layout-menu ul li:last-child {
      margin-bottom: 0;
    }

    .layout-menu ul a {
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
      border-radius: 6px;
      background: transparent;
      transition: all 0.3s ease;
    }

    .layout-menu ul a:hover {
      background: color-mix(in srgb, var(--primary-color) 15%, transparent);
      color: var(--primary-color);
      transform: translateX(4px);
    }

    .layout-menu ul a.active-route {
      background: var(--primary-color);
      color: white;
      transform: translateX(4px);
    }

    /* Section headers */
    .layout-menuitem-root-text {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--primary-color);
      margin: 2rem 0 1rem 0;
      padding: 0.75rem 1.25rem;
      letter-spacing: 0.5px;
      position: relative;
      background: color-mix(in srgb, var(--primary-color) 5%, transparent);
      border-radius: 8px;
      border: 1px solid color-mix(in srgb, var(--primary-color) 15%, transparent);
      text-align: center;
    }

    .layout-menuitem-root-text::before {
      content: '';
      position: absolute;
      left: -1px;
      top: 50%;
      transform: translateY(-50%);
      width: 15px;
      height: 2px;
      background: var(--primary-color);
      border-radius: 1px;
      box-shadow: 0 0 4px var(--primary-color);
    }

    .layout-menuitem-root-text::after {
      content: '';
      position: absolute;
      right: -1px;
      top: 50%;
      transform: translateY(-50%);
      width: 15px;
      height: 2px;
      background: var(--primary-color);
      border-radius: 1px;
      box-shadow: 0 0 4px var(--primary-color);
    }
  `]
})
export class AppMenu implements OnInit {
  model: MenuItem[] = [];

  ngOnInit() {
    const role = localStorage.getItem('role');

    let dashboardLink = '/';
    let dashboardLabel = 'Dashboard';

    if (role === 'SUPER_ADMIN') {
      dashboardLink = '/dashboard-superadmin';
      dashboardLabel = 'Dashboard Super Admin';
    } else if (role === 'ADMIN') {
      dashboardLink = '/dashboard-admin';
      dashboardLabel = 'Dashboard Admin';
    } else if (role === 'ENSEIGNANT') {
      dashboardLink = '/dashboard-enseignant';
      dashboardLabel = 'Dashboard Enseignant';
    }

    this.model = [
      {
        label: 'Home',
        items: [
          { label: dashboardLabel, icon: 'pi pi-fw pi-home', routerLink: [dashboardLink] }
        ]
      },

      

      ...(role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'ENSEIGNANT' ? [{
        label: 'Gestion des Users',
        items: [
          { label: 'Users', icon: 'pi pi-fw pi-id-card', routerLink: ['/users'] }
        ]
      }] : []),



      ...(role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'ENSEIGNANT' ?[{
        label: 'Gestion des Enseignants',
        items: [
          { label: 'Enseignants', icon: 'pi pi-fw pi-id-card', routerLink: ['/enseignants'] }
        ]
      }] : []),

             ...(role === 'SUPER_ADMIN' || role === 'ADMIN' ? [{
           label: 'Gestion des modules',
           styleClass: 'modules-section',
           items: [
             { label: 'Modules', icon: 'pi pi-fw pi-id-card', routerLink: ['/module_manger'] },
             { label: 'Sessions', icon: 'pi pi-fw pi-id-card', routerLink: ['/session'] },
             { label: 'Enseignant/Module', icon: 'pi pi-fw pi-id-card', routerLink: ['/modules'] }
           ]
             }] : role === 'ENSEIGNANT' ? [{
               label: 'Gestion des modules',
               styleClass: 'modules-section',
               items: [
                 { label: 'Enseignant/Module', icon: 'pi pi-fw pi-id-card', routerLink: ['/modules'] }
               ]
             }] : []),

      ...(role === 'SUPER_ADMIN' || role === 'ADMIN'  ? [{
        label: 'Gestion des Classes',
        items: [
          { label: 'Classes', icon: 'pi pi-fw pi-id-card', routerLink: ['/groupe_manager'] }
        ]
      }] : []),

      ...(role === 'SUPER_ADMIN' || role === 'ADMIN' ? [{
        label: 'Affectations',
        styleClass: 'affectations-section',
        items: [
          { label: 'Affectation Modules', icon: 'pi pi-fw pi-calendar', routerLink: ['/affectation-module-calendar'] },
          { label: 'Affectation Salles Auto', icon: 'pi pi-fw pi-home', routerLink: ['/affectation-salle-auto'] },
          { label: 'Affectation Enseignants Auto', icon: 'pi pi-fw pi-users', routerLink: ['/affectation-enseignant-auto'] }
        ]
      }] : []),

      ...(role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'ENSEIGNANT' ? [{
        label: 'Gestion des Examens',
        items: [
          { label: 'Affectation Classes/salles/Enseignants', icon: 'pi pi-fw pi-id-card', routerLink: ['/GestionExamen'] },
          { label: 'Affectation Chrono', icon: 'pi pi-fw pi-id-card', routerLink: ['/examanchreno'] }
        ]
      }] : []),

      ...(role === 'SUPER_ADMIN' || role === 'ADMIN' ? [{
        label: 'Calendrier des Enseignants',
        items: [
          { label: 'Emploi du temps', icon: 'pi pi-fw pi-id-card', routerLink: ['/calendrier-filtre'] }
        ]
      }] : []),

      ...(role === 'SUPER_ADMIN' || role === 'ADMIN' ? [{
        label: 'Calendrier des Surveillances',
        items: [
          { label: 'Emploi du surveillance', icon: 'pi pi-fw pi-id-card', routerLink: ['/Surveillance'] }
        ]
      }] : []),

      ...(role === 'SUPER_ADMIN' || role === 'ADMIN' ? [{
        label: 'Gestion des salles',
        items: [
          { label: 'Salles', icon: 'pi pi-fw pi-id-card', routerLink: ['/salles'] }
        ]
      }] : []),

             {
         label: 'Gestion des Fraudes',
         items: [
           { label: 'Fraudes', icon: 'pi pi-fw pi-id-card', routerLink: ['/fraudes'] }
         ]
       },

       
    ];
  }
}
