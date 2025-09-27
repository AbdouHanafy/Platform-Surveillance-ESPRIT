import { GlobalNotificationService } from './../../Service/global-notification.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// Global notifications are now handled by GlobalNotificationService

import { ExamenChrono, ExamenChronoRequestDTO, ExamenChronoService } from '../../Service/examen-chrono.service';
import { MyModule } from '../../Entity/module.model';
import { Groupe } from '../../Entity/Groupe';
import { Session } from '../../Entity/Session';
import { Salle } from '../../Entity/Salle';

import { AffectationService } from './../../Service/affectation-service.service';
import { SalleService } from '../../Service/salle-service.service';
import { SessionServiceService } from '../../Service/session-service.service';
import { Enseignant } from '../../Entity/Enseignant';
import { EnseignantService } from '../../Service/enseignant-service.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  seance: string;
  module: string;
  groupe: string;
  enseignants: string;
  salles: string;
  periode?: string;
}

interface EventsWithVisibility {
  visibleEvents: CalendarEvent[];
  hiddenEvents: CalendarEvent[];
  totalCount: number;
}

@Component({
  selector: 'app-examen-chrono',
  imports: [CommonModule, ReactiveFormsModule],

   standalone: true,
  templateUrl: './examen-chrono.component.html',
  styleUrls: ['./examen-chrono.component.scss']
})
export class ExamenChronoComponent implements OnInit {
  examenForm: FormGroup;
  examens: ExamenChrono[] = [];
  modules: MyModule[] = [];
  allModules: MyModule[] = []; // Store all modules for filtering
  filteredModules: MyModule[] = []; // Modules filtered by selected session
  groupes: Groupe[] = [];
  sessions: Session[] = [];
  enseignants: Enseignant[] = [];

  totalEnseignants = 0;
  affectedEnseignantsCount = 0;

  showForm = false;
  isLoading = false;

  currentDate = new Date();
  currentWeekStart = new Date();
  weekDays: string[] = [];
  weekDates: string[] = [];
  calendarEvents: { [key: string]: { [seance: string]: CalendarEvent[] } } = {};

  expandedSlots = new Set<string>();
  maxVisibleEvents = 2;

  months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  seances = ['08:00-10:00', '10:15-12:15', '13:30-15:30', '15:45-17:45'];
  periodes = ['PERIODE_1', 'PERIODE_2', 'PERIODE_3', 'PERIODE_4'];

  constructor(
    private fb: FormBuilder,
    private examenService: ExamenChronoService,
    private affectationService: AffectationService,
    private salleService: SalleService,
    private sessionService: SessionServiceService,
        private enseignantService: EnseignantService,
    private notificationService: GlobalNotificationService,
    private http: HttpClient


  ) {
    this.examenForm = this.fb.group({
      sessionId: ['', Validators.required],
      periode: ['PERIODE_1', Validators.required],
      moduleId: ['', Validators.required],
      dateExamen: ['', Validators.required],
      seance: ['', Validators.required]
    });
  }
   // Global notifications are now handled by GlobalNotificationService
  ngOnInit(): void {
    this.initializeWeek();
    this.loadSessions();
    this.loadEnseignants();
    this.loadInitialData();
       const enseignantId = Number(localStorage.getItem('id'));

  if (enseignantId) {
    this.notificationService.connect(enseignantId);
  }

    // Session selection triggers module filtering
    this.examenForm.get('sessionId')?.valueChanges.subscribe(sessionId => {
      console.log('Session changed to:', sessionId);
      this.filterModulesBySession(sessionId);
      this.groupes = [];
      this.examenForm.patchValue({ moduleId: '', dateExamen: '', seance: '' });
    });

    this.examenForm.get('periode')?.valueChanges.subscribe(periode => {
      this.loadModulesByPeriode(periode);
      this.groupes = [];
      this.examenForm.patchValue({ moduleId: '', dateExamen: '', seance: '' });
    });

    this.examenForm.get('moduleId')?.valueChanges.subscribe(moduleId => {
      const periode = this.examenForm.get('periode')?.value;
      if (moduleId && periode) {
        this.loadGroupesByModuleAndPeriode(moduleId, periode);
      } else {
        this.groupes = [];
      }
    });
  }

  loadSessions(): void {
    this.sessionService.getAll().subscribe({
      next: sessions => {
        this.sessions = sessions;
        if (sessions.length > 0) {
          this.examenForm.patchValue({ sessionId: sessions[0].id });
        }
      },
      error: err => console.error('Erreur chargement sessions:', err)
    });
  }

  loadEnseignants(): void {
    this.enseignantService.getAllEnseignants().subscribe({
      next: enseignants => {
        this.enseignants = enseignants;
        this.totalEnseignants = enseignants.length;
      },
      error: err => console.error('Erreur chargement enseignants:', err)
    });
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.loadModulesByPeriode(this.examenForm.get('periode')?.value);
    this.loadExamens();
  }

  loadModulesByPeriode(periode: string): void {
    this.affectationService.getModulesByPeriode(periode).subscribe({
      next: modules => {
        this.allModules = modules; // Store all modules
        this.modules = modules; // Keep current behavior for now
        this.filteredModules = modules; // Initialize filtered modules
        this.isLoading = false;
      },
      error: err => {
        console.error('Erreur chargement modules:', err);
        this.isLoading = false;
      }
    });
  }

  loadGroupesByModuleAndPeriode(moduleId: number, periode: string): void {
    this.affectationService.getGroupesByModuleAndPeriode(moduleId, periode).subscribe({
      next: groupes => this.groupes = groupes,
      error: err => {
        console.error('Erreur chargement groupes:', err);
        this.groupes = [];
      }
    });
  }

  filterModulesBySession(sessionId: number): void {
    console.log('Filtering modules for session:', sessionId);
    
    if (!sessionId) {
      this.filteredModules = this.allModules;
      this.modules = this.allModules;
      return;
    }

    // Find the selected session
    const selectedSession = this.sessions.find(s => s.id === sessionId);
    if (!selectedSession || !selectedSession.moduleIds) {
      console.log('No session found or no modules assigned to session');
      this.filteredModules = [];
      this.modules = [];
      return;
    }

    console.log('Session modules:', selectedSession.moduleIds);
    
    // Filter modules that are assigned to this session
    this.filteredModules = this.allModules.filter(module => 
      selectedSession.moduleIds!.includes(module.id!)
    );
    
    this.modules = this.filteredModules; // Update the modules array used in template
    
    console.log('Filtered modules:', this.filteredModules.map(m => m.libelleModule));
  }

  loadExamens(): void {
    this.examenService.getAllExamens().subscribe({
      next: examens => {
        this.examens = examens;
        console.log('Examens chargés:', examens);

        // Filtrer et récupérer tous les IDs de salles valides
        const salleIdsAll = examens
          .filter(e => e.salleIds && Array.isArray(e.salleIds))
          .flatMap(e => e.salleIds)
          .filter(id => id !== null && id !== undefined);
        const uniqueSalleIds = Array.from(new Set(salleIdsAll));
        console.log('IDs de salles uniques trouvés:', uniqueSalleIds);

        if (uniqueSalleIds.length > 0) {
          this.salleService.getSallesByIds(uniqueSalleIds).subscribe({
            next: salles => {
              console.log('Salles récupérées:', salles);
              const salleMap = new Map<number, string>();
              salles.forEach((s: Salle) => {
                const fullSalleName = `Salle: ${s.bloc}${s.etage}${s.nom}`;
                salleMap.set(s.id, fullSalleName);
              });

              this.examens.forEach(exam => {
                if (exam.salleIds && Array.isArray(exam.salleIds)) {
                  exam['salleNames'] = exam.salleIds
                    .map(id => salleMap.get(id) || '')
                    .filter(n => n)
                    .join(', ');
                  console.log(`Examen ${exam.id}: salleIds=${exam.salleIds}, salleNames=${exam['salleNames']}`);
                } else {
                  exam['salleNames'] = '';
                  console.log(`Examen ${exam.id}: pas de salleIds ou salleIds invalide`);
                }
              });

              this.buildCalendarEvents();
              this.updateAffectedEnseignants();
              this.isLoading = false;
            },
            error: err => {
              console.error('Erreur chargement salles:', err);
              this.examens.forEach(exam => (exam['salleNames'] = ''));
              this.buildCalendarEvents();
              this.updateAffectedEnseignants();
              this.isLoading = false;
            }
          });
        } else {
          console.log('Aucun ID de salle trouvé dans les examens');
          this.examens.forEach(exam => (exam['salleNames'] = ''));
          this.buildCalendarEvents();
          this.updateAffectedEnseignants();
          this.isLoading = false;
        }
      },
      error: err => {
        console.error('Erreur chargement examens:', err);
        this.isLoading = false;
      }
    });
  }

  buildCalendarEvents(): void {
    this.calendarEvents = {};
  
    this.examens.forEach(examen => {
      if (!examen) return;
  
      const dateKey = examen.dateExamen;
      const seanceKey = examen.seance;
  
      if (!this.calendarEvents[dateKey]) this.calendarEvents[dateKey] = {};
      if (!this.calendarEvents[dateKey][seanceKey]) this.calendarEvents[dateKey][seanceKey] = [];
  
      const fullGroup = examen.groupe
        ? `${examen.groupe.niveau}-${examen.groupe.optionGroupe}-${examen.groupe.nomClasse}`
        : 'Groupe inconnu';

      // Récupérer les noms de salles avec vérification
      const salleNames = examen['salleNames'] || '';
      console.log(`Construction événement pour examen ${examen.id}: salleNames="${salleNames}"`);
  
      this.calendarEvents[dateKey][seanceKey].push({
        id: examen.id,
        title: examen.module?.libelleModule || 'Module inconnu',
        date: examen.dateExamen,
        seance: examen.seance,
        module: examen.module?.libelleModule || 'Module inconnu',
        groupe: fullGroup,
        enseignants: examen.enseignants?.filter(e => e != null).map(e => e.nom).join(', ') || 'Aucun',
        salles: salleNames,
        periode: examen.periode || 'PERIODE_1'
      });
    });
  }
  
  updateAffectedEnseignants(): void {
    const affectedIds = new Set<number>();
    this.examens.forEach(ex => {
      ex.enseignants.forEach(e => {
        if (e.id !== undefined) {
          affectedIds.add(e.id);
        }
      });
    });
    this.affectedEnseignantsCount = affectedIds.size;
  }

  canCreateExamen(): boolean {
    if (!this.examenForm.valid) return false;

    const formValue = this.examenForm.value;

    const enseignantsAffectes = new Set<number>();
    this.examens.forEach(ex => {
      if (ex.dateExamen === formValue.dateExamen && ex.seance === formValue.seance) {
        ex.enseignants.forEach(e => {
          if (e.id !== undefined) {
            enseignantsAffectes.add(e.id);
          }
        });
      }
    });

    // TODO: comparer avec enseignants sélectionnés (à ajouter dans le formulaire)

    return true; // autorisé par défaut
  }

  onSubmit(): void {
    if (!this.examenForm.valid) return;

    if (!this.canCreateExamen()) {
      alert('Certains enseignants sont déjà affectés à ce créneau.');
      return;
    }

    this.isLoading = true;
    const formValue = this.examenForm.value;

    const groupesIds = this.groupes.map(g => g.id);

    const observables = groupesIds.map(gid => {
      const dto: ExamenChronoRequestDTO = {
        sessionId: +formValue.sessionId,
        periode: formValue.periode,
        moduleId: +formValue.moduleId,
        dateExamen: formValue.dateExamen,
        seance: formValue.seance,
        groupeId: gid!
      };
      return this.examenService.createExamen(dto);
    });

    forkJoin(observables).subscribe({
      next: (examens) => {
        // Backend automatically sends notifications to assigned enseignants only
        console.log('Examens créés avec succès:', examens);
        
        // Show success message to the creator
        const module = this.modules.find(m => m.id === +formValue.moduleId);
        const moduleName = module ? module.libelleModule : 'Module inconnu';
        this.notificationService.addNotification(
          `Examens créés avec succès pour ${moduleName} le ${formValue.dateExamen} à ${formValue.seance}. Les enseignants assignés ont été notifiés.`, 
          'success'
        );
        
        this.loadExamens();
        this.toggleForm();
        this.isLoading = false;
      },
      error: err => {
        console.error('Erreur création examens:', err);
        this.notificationService.addNotification('Erreur lors de la création des examens', 'error');
        this.isLoading = false;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.examenForm.reset({
        periode: 'PERIODE_1',
        sessionId: this.sessions.length > 0 ? this.sessions[0].id : ''
      });
      this.groupes = [];
      // Reset filtered modules to show all modules
      this.filteredModules = this.allModules;
      this.modules = this.allModules;
    }
  }

  initializeWeek(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    this.currentWeekStart = new Date(today);
    this.currentWeekStart.setDate(today.getDate() + diffToMonday);
    this.generateWeek();
  }

  generateWeek(): void {
    this.weekDays = [];
    this.weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(this.currentWeekStart.getDate() + i);
      this.weekDays.push(this.dayNames[date.getDay()]);
      this.weekDates.push(date.toISOString().split('T')[0]);
    }
  }

  previousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.generateWeek();
    this.expandedSlots.clear();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.generateWeek();
    this.expandedSlots.clear();
  }

  getWeekRange(): string {
    const endDate = new Date(this.currentWeekStart);
    endDate.setDate(this.currentWeekStart.getDate() + 6);
    const startStr = `${this.currentWeekStart.getDate()} ${this.months[this.currentWeekStart.getMonth()]}`;
    const endStr = `${endDate.getDate()} ${this.months[endDate.getMonth()]} ${endDate.getFullYear()}`;
    return `${startStr} - ${endStr}`;
  }

  getEventsForDateAndSeanceWithVisibility(dateKey: string, seance: string, maxVisible: number = 2): EventsWithVisibility {
    const allEvents = this.calendarEvents[dateKey]?.[seance] || [];
    return {
      visibleEvents: allEvents.slice(0, maxVisible),
      hiddenEvents: allEvents.slice(maxVisible),
      totalCount: allEvents.length
    };
  }

  isSlotExpanded(dateKey: string, seance: string): boolean {
    return this.expandedSlots.has(`${dateKey}-${seance}`);
  }

  toggleSlotExpansion(dateKey: string, seance: string): void {
    const slotId = `${dateKey}-${seance}`;
    if (this.expandedSlots.has(slotId)) {
      this.expandedSlots.delete(slotId);
    } else {
      this.expandedSlots.add(slotId);
    }
  }

  getPeriodClass(periode: string): string {
    return 'event-' + periode.toLowerCase();
  }

  isToday(dateKey: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateKey === today;
  }

  sanitizeSeanceClass(seance: string): string {
    return 'event-' + seance.toLowerCase().replace(/[:]/g, '').replace(/-/g, '_');
  }

  getEventTooltip(event: CalendarEvent): string {
    const sallesInfo = event.salles && event.salles.trim() ? event.salles : 'Aucune salle assignée';
    return `${event.module} - ${event.groupe} - ${event.enseignants} - Salle: ${sallesInfo}`;
  }

  getHiddenEventsCount(dateKey: string, seance: string): number {
    const eventData = this.getEventsForDateAndSeanceWithVisibility(dateKey, seance, this.maxVisibleEvents);
    return eventData.hiddenEvents.length;
  }

  hasHiddenEvents(dateKey: string, seance: string): boolean {
    return this.getHiddenEventsCount(dateKey, seance) > 0;
  }

  // Test method for notifications
  testNotification(): void {
    const enseignantId = Number(localStorage.getItem('id'));
    if (enseignantId) {
      this.notificationService.testNotification(enseignantId).subscribe({
        next: (response) => {
          console.log('Test notification response:', response);
          this.notificationService.addNotification(`Test notification sent to enseignant ${enseignantId} - ${new Date().toLocaleTimeString()}`, 'success');
        },
        error: (err) => {
          console.error('Test notification error:', err);
          this.notificationService.addNotification(`Test notification failed for enseignant ${enseignantId} - ${new Date().toLocaleTimeString()}`, 'error');
        }
      });
    } else {
      this.notificationService.addNotification('No enseignant ID found for testing', 'warning');
    }
  }

  // Test WebSocket connection
  testWebSocketConnection(): void {
    const enseignantId = Number(localStorage.getItem('id'));
    if (enseignantId) {
      if (this.notificationService.isConnected()) {
        this.notificationService.addNotification(`WebSocket is connected for enseignant ${enseignantId}`, 'success');
        // Send a test message
        this.notificationService.sendGeneralNotification('Test message from frontend');
      } else {
        this.notificationService.addNotification(`WebSocket is not connected for enseignant ${enseignantId}`, 'warning');
        // Try to reconnect
        this.notificationService.connect(enseignantId);
      }
    } else {
      this.notificationService.addNotification('No enseignant ID found for WebSocket test', 'warning');
    }
  }

  // Test exam creation notification (simulates what happens when creating a real exam)
  testExamCreationNotification(): void {
    // Test with specific enseignant IDs (you can change these to test with different enseignants)
    const testEnseignantIds = [1, 2]; // Example: Iheb (ID: 1) and Samara (ID: 2)
    
    if (testEnseignantIds.length > 0) {
      // Send specific test notification to each enseignant
      testEnseignantIds.forEach(enseignantId => {
        const enseignant = this.enseignants.find(ens => ens.id === enseignantId);
        const enseignantName = enseignant ? enseignant.nom : `Enseignant ${enseignantId}`;
        
        // Create personalized test message for each enseignant
        const personalizedTestMessage = `Bonjour ${enseignantName}, vous avez été assigné à un examen: Test Module avec le groupe Test-Groupe le ${new Date().toLocaleDateString()} (séance: 08:00-10:00).`;
        
        this.notificationService.sendNotificationToEnseignants([enseignantId], personalizedTestMessage).subscribe({
          next: (response) => {
            console.log(`Test notification sent to enseignant ${enseignantName} (ID: ${enseignantId}):`, response);
          },
          error: (err) => {
            console.error(`Test notification failed for enseignant ${enseignantName} (ID: ${enseignantId}):`, err);
          }
        });
      });
      
      this.notificationService.addNotification(`Test notifications sent to ${testEnseignantIds.length} specific enseignants - ${new Date().toLocaleTimeString()}`, 'success');
    } else {
      this.notificationService.addNotification('No enseignants found for testing', 'warning');
    }
  }

  // Test backend notifications directly
  testBackendNotifications(): void {
    // Test the backend endpoint directly
    this.http.get('http://localhost:8090/test-notif-multiple').subscribe({
      next: (response) => {
        console.log('Backend test response:', response);
        this.notificationService.addNotification('Backend notifications test sent successfully', 'success');
      },
      error: (err) => {
        console.error('Backend test error:', err);
        this.notificationService.addNotification('Backend notifications test failed', 'error');
      }
    });
  }

  // ===== NOTIFICATION SYSTEM EXPLANATION =====
  // 
  // How notifications work when creating exams:
  // 1. When an exam is created via createExamenChrono(), the backend automatically:
  //    - Assigns enseignants to the exam (1 or 2 based on group size)
  //    - Sends notifications ONLY to those assigned enseignants
  //    - Uses notificationService.notifyEnseignant(enseignantId, message)
  //
  // 2. Each enseignant receives notifications ONLY for exams they are assigned to
  // 3. The frontend does NOT send additional notifications (to avoid duplicates)
  // 4. Notifications appear in the global notification bell for each enseignant
  //
  // Example: If Iheb and Samara are assigned to an exam, only they receive notifications
  // Other enseignants will NOT receive notifications for this exam

  // Méthode de débogage pour vérifier l'état des examens et leurs salles
  debugExamensState(): void {
    console.log('=== DÉBOGAGE ÉTAT DES EXAMENS ===');
    this.examens.forEach((exam, index) => {
      console.log(`Examen ${index + 1} (ID: ${exam.id}):`);
      console.log(`  - Module: ${exam.module?.libelleModule}`);
      console.log(`  - Date: ${exam.dateExamen}`);
      console.log(`  - Séance: ${exam.seance}`);
      console.log(`  - salleIds:`, exam.salleIds);
      console.log(`  - salleNames:`, exam['salleNames']);
      console.log(`  - Enseignants:`, exam.enseignants?.map(e => e.nom));
      console.log('  ---');
    });
    
    console.log('=== ÉVÉNEMENTS CALENDRIER ===');
    Object.keys(this.calendarEvents).forEach(dateKey => {
      Object.keys(this.calendarEvents[dateKey]).forEach(seanceKey => {
        this.calendarEvents[dateKey][seanceKey].forEach(event => {
          console.log(`Événement ${event.id}: ${event.module} - ${event.salles}`);
        });
      });
    });

    // Vérification spécifique des salles dans les événements
    console.log('=== VÉRIFICATION SPÉCIFIQUE DES SALLES ===');
    this.examens.forEach(exam => {
      const event = this.findEventInCalendar(exam.id);
      if (event) {
        console.log(`Examen ${exam.id}:`);
        console.log(`  - salleNames dans examen: "${exam['salleNames']}"`);
        console.log(`  - salles dans événement: "${event.salles}"`);
        console.log(`  - Égalité: ${exam['salleNames'] === event.salles}`);
      }
    });
  }

  // Méthode utilitaire pour trouver un événement dans le calendrier
  private findEventInCalendar(examenId: number): CalendarEvent | null {
    for (const dateKey in this.calendarEvents) {
      for (const seanceKey in this.calendarEvents[dateKey]) {
        const event = this.calendarEvents[dateKey][seanceKey].find(e => e.id === examenId);
        if (event) return event;
      }
    }
    return null;
  }
}
