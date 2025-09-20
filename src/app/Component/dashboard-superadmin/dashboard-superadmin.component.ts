import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserServiceService } from '../../Service/user-service.service';
import { EnseignantService } from '../../Service/enseignant-service.service';
import { ExamenBesoinsService, ExamenBesoins } from '../../Service/examen-besoins.service';
import { GlobalNotificationService, NotificationMessage } from '../../Service/global-notification.service';
import { SalleService } from '../../Service/salle-service.service';
import { ModuleServiceService } from '../../Service/module-service.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-superadmin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-superadmin.component.html',
  styleUrl: './dashboard-superadmin.component.scss'
})
export class DashboardSuperadminComponent implements OnInit, AfterViewInit {
  private userService = inject(UserServiceService);
  private enseignantService = inject(EnseignantService);
  private examenBesoinsService = inject(ExamenBesoinsService);
  private notificationService = inject(GlobalNotificationService);
  private salleService = inject(SalleService);
  private moduleService = inject(ModuleServiceService);
  private router = inject(Router);

  // KPI cards
  totalUsers = 0;
  totalTeachers = 0;
  totalExams = 0;
  totalSalles = 0;
  totalClasses = 0;
  pendingFraudes = 0;

  // Lists
  latestUsers: any[] = [];
  latestExams: ExamenBesoins[] = [];
  notifications: NotificationMessage[] = [];
  unreadCount = 0;

  loading = true;

  // Charts
  @ViewChild('examsPeriodeChart') examsPeriodeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('usersRoleChart') usersRoleChartRef!: ElementRef<HTMLCanvasElement>;
  private examsChart?: any;
  private rolesChart?: any;

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Charts will be created after data load
  }

  private loadData() {
    this.loading = true;
    // Users
    this.userService.getAllUsers().subscribe((users) => {
      this.totalUsers = users.length;
      this.latestUsers = users.slice(-5).reverse();
      this.buildUsersRoleChart(users);
    });

    // Teachers
    this.enseignantService.getAllEnseignants().subscribe((ens) => {
      this.totalTeachers = ens.length;
    });

    // Exams (needs per period)
    this.examenBesoinsService.getAll().subscribe((exams) => {
      this.totalExams = exams.length;
      this.latestExams = exams.slice(-5).reverse();
      this.buildExamsPeriodeChart(exams);
    });

    // Salles
    this.salleService.getAllSalles().subscribe((salles) => {
      this.totalSalles = salles.length;
    });

    // Classes
    this.moduleService.getAllGroupes().subscribe((classes) => {
      this.totalClasses = classes.length;
    });

    // Pending fraudes - approximate via fraude service if available in future
    this.pendingFraudes = 0;

    // Notifications
    this.notificationService.notificationsList$.subscribe(list => {
      this.notifications = list.slice(0, 6);
    });
    this.notificationService.getUnreadCount().subscribe(c => this.unreadCount = c);

    this.loading = false;
  }

  private buildExamsPeriodeChart(exams: ExamenBesoins[]) {
    if (!this.examsPeriodeChartRef) return;
    
    // Define all possible periods
    const allPeriods = ['PERIODE_1', 'PERIODE_2', 'PERIODE_3', 'PERIODE_4'];
    
    // Count exams for each period
    const counts: Record<string, number> = {};
    allPeriods.forEach(period => {
      counts[period] = 0;
    });
    
    exams.forEach(e => {
      if (counts.hasOwnProperty(e.periode)) {
        counts[e.periode] = (counts[e.periode] || 0) + 1;
      }
    });
    
    const labels = allPeriods.map(p => p.replace('_', ' '));
    const data = allPeriods.map(p => counts[p]);

    if (this.examsChart) this.examsChart.destroy();
    this.examsChart = new (Chart as any)(this.examsPeriodeChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Examens par période',
          data,
          borderColor: getComputedStyle(document.documentElement).getPropertyValue('--brand-red').trim() || '#dc2626',
          backgroundColor: 'rgba(220,38,38,0.1)',
          tension: 0.35,
          fill: true
        }]
      },
      options: { 
        responsive: true, 
        plugins: { legend: { display: false } }, 
        scales: { 
          y: { beginAtZero: true },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0
            }
          }
        } 
      }
    });
  }

  private buildUsersRoleChart(users: any[]) {
    if (!this.usersRoleChartRef) return;
    const counts: Record<string, number> = {};
    users.forEach(u => {
      const role = (u.role || 'INCONNU').toString();
      counts[role] = (counts[role] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const data = labels.map(l => counts[l]);

    if (this.rolesChart) this.rolesChart.destroy();
    this.rolesChart = new (Chart as any)(this.usersRoleChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#dc2626', '#6b7280', '#ef4444', '#111827', '#9ca3af']
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }

  markAllNotificationsRead() {
    this.notificationService.markAllAsRead();
  }

  go(path: string) {
    this.router.navigate([path]);
  }
}
