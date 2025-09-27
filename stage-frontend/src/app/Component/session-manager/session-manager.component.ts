import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SessionServiceService } from '../../Service/session-service.service';
import { ModuleServiceService } from '../../Service/module-service.service';
import { Session } from '../../Entity/Session';
import { MyModule } from '../../Entity/module.model';

@Component({
  selector: 'app-session-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './session-manager.component.html',
  styleUrl: './session-manager.component.scss'
})
export class SessionManagerComponent implements OnInit {
  sessions: Session[] = [];
  newSession: Session = { nom_session: '' };
  editingSession: Session | null = null;
  showForm = false;
  
  // Module assignment properties
  allModules: MyModule[] = [];
  selectedSession: Session | null = null;
  showModuleAssignment = false;
  selectedModuleIds: number[] = [];
  
  // Module search/filter properties
  moduleSearchTerm = '';
  showAllModules = false;
  filteredModules: MyModule[] = [];
  
  // View assigned modules properties
  showAssignedModules = false;
  assignedModulesToView: MyModule[] = [];

  constructor(
    private sessionService: SessionServiceService,
    private moduleService: ModuleServiceService
  ) {}

  ngOnInit(): void {
    this.loadSessions();
    this.loadModules();
    
    // Add a test session if no sessions exist
    setTimeout(() => {
      if (this.sessions.length === 0) {
        console.log('No sessions found, adding a test session...');
        this.addTestSession();
      }
    }, 2000);
  }

  get editing(): boolean {
    return this.editingSession !== null;
  }

  get sessionModel(): Session {
    return this.editingSession ?? this.newSession;
  }

  loadSessions(): void {
    console.log('Loading sessions...');
    this.sessionService.getAll().subscribe({
      next: (data) => {
        console.log('Sessions loaded successfully:', data);
        this.sessions = data;
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
        alert('Erreur lors du chargement des sessions: ' + error.message);
        this.sessions = []; // Ensure sessions array is initialized
      }
    });
  }

  saveSession(): void {
    const sessionToSave = this.editingSession ?? this.newSession;
    this.sessionService[this.editing ? 'update' : 'add'](sessionToSave).subscribe(() => {
      this.editingSession = null;
      this.newSession = { nom_session: '' };
      this.showForm = false;
      this.loadSessions();
    });
  }

  editSession(session: Session): void {
    this.editingSession = { ...session };
    this.showForm = true;
  }

  deleteSession(id?: number): void {
    if (id != null && confirm('Voulez-vous vraiment supprimer cette session ?')) {
      this.sessionService.delete(id).subscribe(() => this.loadSessions());
    }
  }

  cancelEdit(): void {
    this.editingSession = null;
    this.newSession = { nom_session: '' };
    this.showForm = false;
  }

  openAddForm(): void {
    this.editingSession = null;
    this.newSession = { nom_session: '' };
    this.showForm = true;
  }

  closeForm(): void {
    this.cancelEdit();
  }

  trackBySessionId(index: number, session: Session): any {
    return session.id || index;
  }

  // Module assignment methods
  loadModules(): void {
    this.moduleService.getAll().subscribe((data) => {
      this.allModules = data;
      this.filteredModules = data.slice(0, 10); // Show only first 10 by default
    });
  }

  openModuleAssignment(session: Session): void {
    this.selectedSession = session;
    this.selectedModuleIds = session.moduleIds || [];
    this.moduleSearchTerm = '';
    this.showAllModules = false;
    this.filteredModules = this.allModules.slice(0, 10); // Reset to first 10
    this.showModuleAssignment = true;
  }

  closeModuleAssignment(): void {
    this.selectedSession = null;
    this.selectedModuleIds = [];
    this.moduleSearchTerm = '';
    this.showAllModules = false;
    this.showModuleAssignment = false;
  }

  toggleModuleSelection(moduleId: number): void {
    const index = this.selectedModuleIds.indexOf(moduleId);
    if (index > -1) {
      this.selectedModuleIds.splice(index, 1);
    } else {
      this.selectedModuleIds.push(moduleId);
    }
  }

  isModuleSelected(moduleId: number): boolean {
    return this.selectedModuleIds.includes(moduleId);
  }

  saveModuleAssignment(): void {
    if (this.selectedSession && this.selectedSession.id) {
      console.log('Saving module assignment for session:', this.selectedSession.id);
      console.log('Selected module IDs:', this.selectedModuleIds);
      
      this.sessionService.assignModulesToSession(this.selectedSession.id, this.selectedModuleIds)
        .subscribe({
          next: (response) => {
            console.log('Module assignment successful:', response);
            this.loadSessions(); // Reload sessions to get updated module data
            this.closeModuleAssignment();
          },
          error: (error) => {
            console.error('Error assigning modules:', error);
            alert('Erreur lors de l\'assignation des modules: ' + error.message);
          }
        });
    } else {
      console.error('No selected session or session ID');
      alert('Aucune session sélectionnée');
    }
  }

  removeModuleFromSession(session: Session, moduleId: number): void {
    if (session.id) {
      this.sessionService.removeModuleFromSession(session.id, moduleId)
        .subscribe(() => {
          this.loadSessions(); // Reload sessions to get updated module data
        });
    }
  }

  addTestSession(): void {
    const testSession: Session = {
      nom_session: 'Session Test ' + new Date().getTime()
    };
    
    console.log('Adding test session:', testSession);
    this.sessionService.add(testSession).subscribe({
      next: (response) => {
        console.log('Test session added successfully:', response);
        this.loadSessions(); // Reload sessions
      },
      error: (error) => {
        console.error('Error adding test session:', error);
        alert('Erreur lors de l\'ajout de la session test: ' + error.message);
      }
    });
  }

  getModuleName(moduleId: number): string {
    const module = this.allModules.find(m => m.id === moduleId);
    return module ? module.libelleModule : `Module ${moduleId}`;
  }

  formatPeriod(dateDebut: string, dateFin: string): string {
    if (!dateDebut || !dateFin) return '';

    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);

    const startFormatted = startDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });

    const endFormatted = endDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });

    return `${startFormatted} - ${endFormatted}`;
  }

  getPeriodeDisplayName(periode: string): string {
    const periodeMap: { [key: string]: string } = {
      'PERIODE_1': 'Période 1 (Semestre 1)',
      'PERIODE_2': 'Période 2 (Semestre 1)', 
      'PERIODE_3': 'Période 3 (Semestre 2)',
      'PERIODE_4': 'Période 4 (Semestre 2)'
    };
    return periodeMap[periode] || periode;
  }

  getTypeSessionDisplayName(typeSession: string): string {
    const typeMap: { [key: string]: string } = {
      'NORMALE': 'Session Normale',
      'RATTRAPAGE': 'Session de Rattrapage'
    };
    return typeMap[typeSession] || typeSession;
  }

  // Module search and filter methods
  searchModules(): void {
    if (this.moduleSearchTerm.trim() === '') {
      this.filteredModules = this.showAllModules ? this.allModules : this.allModules.slice(0, 10);
    } else {
      const searchTerm = this.moduleSearchTerm.toLowerCase();
      this.filteredModules = this.allModules.filter(module => 
        module.libelleModule.toLowerCase().includes(searchTerm) ||
        module.codeModule.toLowerCase().includes(searchTerm)
      );
    }
  }

  toggleShowAllModules(): void {
    this.showAllModules = !this.showAllModules;
    this.searchModules();
  }

  clearSearch(): void {
    this.moduleSearchTerm = '';
    this.searchModules();
  }

  // View assigned modules methods
  viewAssignedModules(session: Session): void {
    this.selectedSession = session;
    this.assignedModulesToView = [];
    
    if (session.moduleIds && session.moduleIds.length > 0) {
      // Get full module details for assigned modules
      this.assignedModulesToView = this.allModules.filter(module => 
        session.moduleIds!.includes(module.id)
      );
    }
    
    this.showAssignedModules = true;
  }

  closeAssignedModulesView(): void {
    this.showAssignedModules = false;
    this.selectedSession = null;
    this.assignedModulesToView = [];
  }

  removeModuleFromAssignedView(moduleId: number): void {
    if (this.selectedSession && this.selectedSession.id) {
      this.sessionService.removeModuleFromSession(this.selectedSession.id, moduleId)
        .subscribe(() => {
          // Update the local view
          this.assignedModulesToView = this.assignedModulesToView.filter(m => m.id !== moduleId);
          // Update the session's moduleIds
          if (this.selectedSession) {
            this.selectedSession.moduleIds = this.selectedSession.moduleIds?.filter(id => id !== moduleId) || [];
          }
          // Reload sessions to update the main view
          this.loadSessions();
        });
    }
  }
}