import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AffectationService } from './affectation-service.service';
import { SalleService } from './salle-service.service';
import { EnseignantService } from './enseignant-service.service';
import { EmploiDuTempsService } from './emploi-du-temps.service';

export interface ModuleAffectationData {
  id: number;
  module: {
    idModule: number;
    libelleModule: string;
  };
  groupe: {
    id: number;
    niveau: string;
    optionGroupe: string;
    nomClasse: string;
    effectif: number;
    departement: string;
  };
  periode: string;
  date: string; // YYYY-MM-DD format
  heureDebut: string;
  heureFin: string;
  
  // Assignment status
  salleAffectee: boolean;
  salleId?: number;
  salleNom?: string;
  salleCapacite?: number;
  
  enseignantAffecte: boolean;
  enseignantId?: number;
  enseignantNom?: string;
  enseignantGrade?: string;
  
  // Additional info
  typeExamen: string;
  statut: 'PENDING' | 'SALLE_ASSIGNED' | 'ENSEIGNANT_ASSIGNED' | 'FULLY_ASSIGNED';
}

@Injectable({
  providedIn: 'root'
})
export class SharedAffectationService {
  
  // Shared data streams
  private moduleAffectationsSubject = new BehaviorSubject<ModuleAffectationData[]>([]);
  private sallesSubject = new BehaviorSubject<any[]>([]);
  private enseignantsSubject = new BehaviorSubject<any[]>([]);
  private modulesSubject = new BehaviorSubject<any[]>([]);
  private groupesSubject = new BehaviorSubject<any[]>([]);
  
  // Public observables
  public moduleAffectations$ = this.moduleAffectationsSubject.asObservable();
  public salles$ = this.sallesSubject.asObservable();
  public enseignants$ = this.enseignantsSubject.asObservable();
  public modules$ = this.modulesSubject.asObservable();
  public groupes$ = this.groupesSubject.asObservable();

  // Current week dates for calendar synchronization
  private currentWeekDatesSubject = new BehaviorSubject<string[]>([]);
  public currentWeekDates$ = this.currentWeekDatesSubject.asObservable();

  constructor(
    private affectationService: AffectationService,
    private salleService: SalleService,
    private enseignantService: EnseignantService,
    private emploiDuTempsService: EmploiDuTempsService
  ) {
    this.initializeData();
  }

  // Initialize all data
  initializeData() {
    this.loadAllData();
  }

  // Load all data from backend
  loadAllData() {
    // Load base data
    this.loadSalles();
    this.loadEnseignants();
    this.loadModules();
    this.loadGroupes();
    this.loadModuleAffectations();
  }

  // Load salles
  loadSalles() {
    this.salleService.getAllSalles().subscribe({
      next: (data) => {
        const salles = data.map((salle: any) => ({
          label: `${salle.nomSalle} (Capacité: ${salle.capacite})`,
          value: salle.id,
          ...salle
        }));
        this.sallesSubject.next(salles);
      },
      error: (error) => {
        console.error('Error loading salles:', error);
        this.sallesSubject.next([]);
      }
    });
  }

  // Load enseignants
  loadEnseignants() {
    this.enseignantService.getAllEnseignants().subscribe({
      next: (data) => {
        const enseignants = data.map((enseignant: any) => ({
          label: `${enseignant.nom} ${enseignant.prenom} - ${enseignant.grade || 'N/A'}`,
          value: enseignant.id,
          ...enseignant
        }));
        this.enseignantsSubject.next(enseignants);
      },
      error: (error) => {
        console.error('Error loading enseignants:', error);
        this.enseignantsSubject.next([]);
      }
    });
  }

  // Load modules
  loadModules() {
    this.enseignantService.getAllModules().subscribe({
      next: (data) => {
        const modules = data.map((module: any) => ({
          label: module.libelleModule,
          value: module.id,
          ...module
        }));
        this.modulesSubject.next(modules);
      },
      error: (error) => {
        console.error('Error loading modules:', error);
        this.modulesSubject.next([]);
      }
    });
  }

  // Load groupes
  loadGroupes() {
    this.emploiDuTempsService.getAllGroupes().subscribe({
      next: (data) => {
        const groupes = data.map((groupe: any) => ({
          label: `${groupe.niveau}${groupe.optionGroupe}${groupe.nomClasse} (${groupe.effectif} étudiants)`,
          value: groupe.id,
          ...groupe
        }));
        this.groupesSubject.next(groupes);
      },
      error: (error) => {
        console.error('Error loading groupes:', error);
        this.groupesSubject.next([]);
      }
    });
  }

  // Load module affectations - ALWAYS START WITH BASE AFFECTATIONS
  loadModuleAffectations() {
    const currentWeekDates = this.getCurrentWeekDates();
    
    // ALWAYS start with the base affectations (module-groupe pairs)
    this.affectationService.getAllAffectations().subscribe({
      next: (affectations) => {
        console.log('Loaded base affectations from backend:', affectations);
        
        if (affectations && affectations.length > 0) {
          const moduleAffectations: ModuleAffectationData[] = affectations.map((affectation: any) => ({
            id: affectation.id,
            module: affectation.module,
            groupe: affectation.groupe,
            periode: affectation.periode,
            date: this.getRandomDateInWeek(currentWeekDates),
            heureDebut: this.getTimeForPeriode(affectation.periode).split('-')[0],
            heureFin: this.getTimeForPeriode(affectation.periode).split('-')[1],
            
            // Start with no assignments - they will be loaded separately
            salleAffectee: false,
            salleId: undefined,
            salleNom: undefined,
            salleCapacite: undefined,
            
            enseignantAffecte: false,
            enseignantId: undefined,
            enseignantNom: undefined,
            enseignantGrade: undefined,
            
            typeExamen: 'SURVEILLANCE',
            statut: 'PENDING'
          }));
          
          this.moduleAffectationsSubject.next(moduleAffectations);
          
          // Now check for existing emplois and update assignments
          this.loadExistingAssignments(moduleAffectations);
        } else {
          console.log('No base affectations found - creating sample data for testing');
          // Create some sample data if no affectations exist
          this.createSampleAffectations(currentWeekDates);
        }
        
        this.currentWeekDatesSubject.next(currentWeekDates);
      },
      error: (error) => {
        console.error('Error loading base affectations:', error);
        // Create sample data if backend fails
        this.createSampleAffectations(currentWeekDates);
        this.currentWeekDatesSubject.next(currentWeekDates);
      }
    });
  }

  // Create sample affectations for testing when database is empty
  private createSampleAffectations(currentWeekDates: string[]) {
    const sampleAffectations: ModuleAffectationData[] = [
      {
        id: 1,
        module: { idModule: 1, libelleModule: 'Programmation Web' },
        groupe: { id: 1, niveau: '3', optionGroupe: 'INFO', nomClasse: 'A', effectif: 25, departement: 'Informatique' },
        periode: 'PERIODE_1',
        date: currentWeekDates[0], // Monday
        heureDebut: '08:00',
        heureFin: '10:00',
        salleAffectee: false,
        enseignantAffecte: false,
        typeExamen: 'SURVEILLANCE',
        statut: 'PENDING'
      },
      {
        id: 2,
        module: { idModule: 2, libelleModule: 'Base de Données' },
        groupe: { id: 2, niveau: '3', optionGroupe: 'INFO', nomClasse: 'B', effectif: 28, departement: 'Informatique' },
        periode: 'PERIODE_2',
        date: currentWeekDates[1], // Tuesday
        heureDebut: '10:15',
        heureFin: '12:15',
        salleAffectee: false,
        enseignantAffecte: false,
        typeExamen: 'SURVEILLANCE',
        statut: 'PENDING'
      },
      {
        id: 3,
        module: { idModule: 3, libelleModule: 'Réseaux' },
        groupe: { id: 3, niveau: '2', optionGroupe: 'INFO', nomClasse: 'A', effectif: 30, departement: 'Informatique' },
        periode: 'PERIODE_3',
        date: currentWeekDates[2], // Wednesday
        heureDebut: '14:00',
        heureFin: '16:00',
        salleAffectee: false,
        enseignantAffecte: false,
        typeExamen: 'SURVEILLANCE',
        statut: 'PENDING'
      },
      {
        id: 4,
        module: { idModule: 4, libelleModule: 'Systèmes d\'Exploitation' },
        groupe: { id: 4, niveau: '2', optionGroupe: 'INFO', nomClasse: 'B', effectif: 22, departement: 'Informatique' },
        periode: 'PERIODE_4',
        date: currentWeekDates[3], // Thursday
        heureDebut: '16:15',
        heureFin: '18:15',
        salleAffectee: false,
        enseignantAffecte: false,
        typeExamen: 'SURVEILLANCE',
        statut: 'PENDING'
      }
    ];

    console.log('Created sample affectations for testing:', sampleAffectations);
    this.moduleAffectationsSubject.next(sampleAffectations);
  }

  // Load existing assignments from emplois and update the affectations
  private loadExistingAssignments(baseAffectations: ModuleAffectationData[]) {
    this.affectationService.getAllEmplois().subscribe({
      next: (emplois) => {
        console.log('Loaded existing emplois:', emplois);
        
        if (emplois && emplois.length > 0) {
          // Update base affectations with existing assignments
          const updatedAffectations = baseAffectations.map(affectation => {
            // Find matching emploi for this affectation
            const matchingEmploi = emplois.find((emploi: any) => 
              emploi.moduleId === affectation.module.idModule &&
              emploi.groupeId === affectation.groupe.id &&
              emploi.date === affectation.date
            );
            
            if (matchingEmploi) {
              return {
                ...affectation,
                salleAffectee: !!matchingEmploi.salleId,
                salleId: matchingEmploi.salleId,
                salleNom: matchingEmploi.salle || `Salle ${matchingEmploi.salleId}`,
                salleCapacite: 30, // Default capacity
                
                enseignantAffecte: !!matchingEmploi.enseignantId,
                enseignantId: matchingEmploi.enseignantId,
                enseignantNom: matchingEmploi.enseignantId ? 'Enseignant assigné' : undefined,
                
                statut: this.getStatutFromAssignments(!!matchingEmploi.salleId, !!matchingEmploi.enseignantId)
              };
            }
            
            return affectation; // No changes if no matching emploi
          });
          
          this.moduleAffectationsSubject.next(updatedAffectations);
          console.log('Updated affectations with existing assignments:', updatedAffectations);
        }
      },
      error: (error) => {
        console.error('Error loading existing emplois:', error);
        // Keep base affectations even if emplois loading fails
      }
    });
  }

  // Fallback method using affectations API
  private loadAffectationsAsFallback() {
    this.affectationService.getAllAffectations().subscribe({
      next: (data) => {
        const currentWeekDates = this.getCurrentWeekDates();
        
        const moduleAffectations: ModuleAffectationData[] = data.map((affectation: any) => ({
          id: affectation.id,
          module: affectation.module,
          groupe: affectation.groupe,
          periode: affectation.periode,
          date: this.getRandomDateInWeek(currentWeekDates),
          heureDebut: this.getTimeForPeriode(affectation.periode).split('-')[0],
          heureFin: this.getTimeForPeriode(affectation.periode).split('-')[1],
          
          // Check if already has assignments (from previous operations)
          salleAffectee: affectation.salleAffectee || false,
          salleId: affectation.salleId,
          salleNom: affectation.salleNom,
          salleCapacite: affectation.salleCapacite,
          
          enseignantAffecte: affectation.enseignantAffecte || false,
          enseignantId: affectation.enseignantId,
          enseignantNom: affectation.enseignantNom,
          enseignantGrade: affectation.enseignantGrade,
          
          typeExamen: 'SURVEILLANCE',
          statut: this.getStatutFromAssignments(affectation.salleAffectee || false, affectation.enseignantAffecte || false)
        }));
        
        this.moduleAffectationsSubject.next(moduleAffectations);
        this.currentWeekDatesSubject.next(this.getCurrentWeekDates());
      },
      error: (error) => {
        console.error('Error loading module affectations:', error);
        this.moduleAffectationsSubject.next([]);
      }
    });
  }

  private getStatutFromAssignments(salleAffectee: boolean, enseignantAffecte: boolean): 'PENDING' | 'SALLE_ASSIGNED' | 'ENSEIGNANT_ASSIGNED' | 'FULLY_ASSIGNED' {
    if (salleAffectee && enseignantAffecte) return 'FULLY_ASSIGNED';
    if (salleAffectee) return 'SALLE_ASSIGNED';
    if (enseignantAffecte) return 'ENSEIGNANT_ASSIGNED';
    return 'PENDING';
  }

  private getPeriodeFromTime(time: string): string {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 8 && hour < 10) return 'PERIODE_1';
    if (hour >= 10 && hour < 12) return 'PERIODE_2';
    if (hour >= 14 && hour < 16) return 'PERIODE_3';
    if (hour >= 16 && hour < 18) return 'PERIODE_4';
    return 'PERIODE_1';
  }

  // SHARED ASSIGNMENT METHODS

  // Assign ALL modules to salles randomly - REAL BACKEND CALLS
  assignAllSallesRandomly(): Observable<{success: number, total: number}> {
    return new Observable(observer => {
      const currentAffectations = this.moduleAffectationsSubject.value;
      const currentSalles = this.sallesSubject.value;
      
      if (currentSalles.length === 0) {
        observer.error('Aucune salle disponible');
        return;
      }

      let assignedCount = 0;
      let processedCount = 0;
      const totalCount = currentAffectations.length;

      if (totalCount === 0) {
        observer.next({ success: 0, total: 0 });
        observer.complete();
        return;
      }

      // Process each affectation
      currentAffectations.forEach(affectation => {
        if (affectation.salleAffectee) {
          // Skip if already assigned
          processedCount++;
          if (processedCount === totalCount) {
            observer.next({ success: assignedCount, total: totalCount });
            observer.complete();
          }
          return;
        }

        // Get suitable salles for this group size
        const suitableSalles = currentSalles.filter(salle => 
          salle.capacite >= Math.ceil(affectation.groupe.effectif * 1.1)
        );
        
        if (suitableSalles.length > 0) {
          const randomSalle = suitableSalles[Math.floor(Math.random() * suitableSalles.length)];
          
          // Create emploi du temps object matching the interface
          const emploiData = {
            id: affectation.id,
            enseignantId: affectation.enseignantId || 0,
            groupeId: affectation.groupe.id,
            date: affectation.date,
            heureDebut: affectation.heureDebut,
            heureFin: affectation.heureFin,
            typeActivite: affectation.typeExamen,
            salle: randomSalle.nomSalle
          };

          // Save to backend via emploi du temps service
          this.emploiDuTempsService.create(emploiData).subscribe({
            next: (savedEmploi) => {
              console.log('Salle assignment saved to backend:', savedEmploi);
            },
            error: (error) => {
              console.error('Error saving salle assignment to backend:', error);
            }
          });

          // Update local state immediately for UI responsiveness
          this.assignSalleToModule(affectation.id, randomSalle.id, randomSalle.nomSalle, randomSalle.capacite);
          assignedCount++;
        }

        processedCount++;
        
        // Complete when all processed
        if (processedCount === totalCount) {
          observer.next({ success: assignedCount, total: totalCount });
          observer.complete();
        }
      });
    });
  }

  // Assign ALL modules to enseignants randomly - REAL BACKEND CALLS
  assignAllEnseignantsRandomly(): Observable<{success: number, total: number}> {
    return new Observable(observer => {
      const currentAffectations = this.moduleAffectationsSubject.value;
      const currentEnseignants = this.enseignantsSubject.value;
      
      if (currentEnseignants.length === 0) {
        observer.error('Aucun enseignant disponible');
        return;
      }

      let assignedCount = 0;
      let processedCount = 0;
      const totalCount = currentAffectations.length;

      if (totalCount === 0) {
        observer.next({ success: 0, total: 0 });
        observer.complete();
        return;
      }

      // Process each affectation
      currentAffectations.forEach(affectation => {
        if (affectation.enseignantAffecte) {
          // Skip if already assigned
          processedCount++;
          if (processedCount === totalCount) {
            observer.next({ success: assignedCount, total: totalCount });
            observer.complete();
          }
          return;
        }

        const randomEnseignant = currentEnseignants[Math.floor(Math.random() * currentEnseignants.length)];
        
        // Prepare backend request for automatic enseignant assignment
        const request = {
          moduleId: affectation.module.idModule,
          moduleLibelle: affectation.module.libelleModule,
          groupeId: affectation.groupe.id,
          salleId: affectation.salleId || 1, // Use assigned salle or default
          date: affectation.date,
          heureDebut: affectation.heureDebut,
          heureFin: affectation.heureFin,
          typeExamen: affectation.typeExamen
        };

        // Call backend for automatic enseignant assignment
        this.affectationService.affecterEnseignantAutomatiquement(request).subscribe({
          next: (response) => {
            // Update local state with backend response
            this.assignEnseignantToModule(
              affectation.id, 
              response.enseignant?.id || randomEnseignant.id,
              response.enseignant?.nom || `${randomEnseignant.nom} ${randomEnseignant.prenom}`,
              response.enseignant?.grade || randomEnseignant.grade
            );
            assignedCount++;
            processedCount++;
            
            if (processedCount === totalCount) {
              observer.next({ success: assignedCount, total: totalCount });
              observer.complete();
            }
          },
          error: (error) => {
            console.error('Backend assignment error for module:', affectation.id, error);
            // Still update local state even if backend fails
            this.assignEnseignantToModule(
              affectation.id,
              randomEnseignant.id,
              `${randomEnseignant.nom} ${randomEnseignant.prenom}`,
              randomEnseignant.grade
            );
            assignedCount++;
            processedCount++;
            
            if (processedCount === totalCount) {
              observer.next({ success: assignedCount, total: totalCount });
              observer.complete();
            }
          }
        });
      });
    });
  }

  // Get modules for specific date and periode
  getModulesForDateAndPeriode(date: string, periode: string): ModuleAffectationData[] {
    const currentAffectations = this.moduleAffectationsSubject.value;
    return currentAffectations.filter(affectation => 
      affectation.date === date && affectation.periode === periode
    );
  }

  // Statistics methods
  getTotalModules(): number {
    return this.moduleAffectationsSubject.value.length;
  }

  getSallesAssignedCount(): number {
    return this.moduleAffectationsSubject.value.filter(m => m.salleAffectee).length;
  }

  getEnseignantsAssignedCount(): number {
    return this.moduleAffectationsSubject.value.filter(m => m.enseignantAffecte).length;
  }

  getFullyAssignedCount(): number {
    return this.moduleAffectationsSubject.value.filter(m => m.salleAffectee && m.enseignantAffecte).length;
  }

  getOccupationRate(): number {
    const total = this.getTotalModules();
    if (total === 0) return 0;
    return Math.round((this.getFullyAssignedCount() / total) * 100);
  }

  // Helper methods
  private getCurrentWeekDates(): string[] {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() + diffToMonday);
    
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    return weekDates;
  }

  private getRandomDateInWeek(weekDates: string[]): string {
    const randomDayIndex = Math.floor(Math.random() * weekDates.length);
    return weekDates[randomDayIndex] || weekDates[0];
  }

  private getTimeForPeriode(periode: string): string {
    const timeSlots = {
      'PERIODE_1': '08:00-10:00',
      'PERIODE_2': '10:15-12:15', 
      'PERIODE_3': '14:00-16:00',
      'PERIODE_4': '16:15-18:15'
    };
    return timeSlots[periode as keyof typeof timeSlots] || '08:00-10:00';
  }

  // Update week dates (for calendar navigation)
  updateWeekDates(newWeekDates: string[]) {
    this.currentWeekDatesSubject.next(newWeekDates);
    // Regenerate affectations for new week
    this.loadModuleAffectations();
  }

  // Manual assignment methods (for individual updates)
  assignSalleToModule(moduleId: number, salleId: number, salleNom: string, salleCapacite: number) {
    const currentAffectations = this.moduleAffectationsSubject.value;
    const updatedAffectations = currentAffectations.map(affectation => {
      if (affectation.id === moduleId) {
        return {
          ...affectation,
          salleAffectee: true,
          salleId,
          salleNom,
          salleCapacite,
          statut: affectation.enseignantAffecte ? 'FULLY_ASSIGNED' : 'SALLE_ASSIGNED'
        };
      }
      return affectation;
    });
    
    this.moduleAffectationsSubject.next(updatedAffectations);
  }

  assignEnseignantToModule(moduleId: number, enseignantId: number | undefined, enseignantNom: string | undefined, enseignantGrade: string | undefined) {
    const currentAffectations = this.moduleAffectationsSubject.value;
    const updatedAffectations = currentAffectations.map(affectation => {
      if (affectation.id === moduleId) {
        const isAssigning = enseignantId !== undefined && enseignantId !== 0;
        return {
          ...affectation,
          enseignantAffecte: isAssigning,
          enseignantId: isAssigning ? enseignantId : undefined,
          enseignantNom: isAssigning ? enseignantNom : undefined,
          enseignantGrade: isAssigning ? enseignantGrade : undefined,
          statut: this.getStatutFromAssignments(affectation.salleAffectee, isAssigning)
        };
      }
      return affectation;
    });
    
    this.moduleAffectationsSubject.next(updatedAffectations);
  }

  // Remove salle assignment
  removeSalleFromModule(moduleId: number) {
    const currentAffectations = this.moduleAffectationsSubject.value;
    const updatedAffectations = currentAffectations.map(affectation => {
      if (affectation.id === moduleId) {
        return {
          ...affectation,
          salleAffectee: false,
          salleId: undefined,
          salleNom: undefined,
          salleCapacite: undefined,
          statut: this.getStatutFromAssignments(false, affectation.enseignantAffecte)
        };
      }
      return affectation;
    });
    
    this.moduleAffectationsSubject.next(updatedAffectations);
  }

  // Remove enseignant assignment
  removeEnseignantFromModule(moduleId: number) {
    const currentAffectations = this.moduleAffectationsSubject.value;
    const updatedAffectations = currentAffectations.map(affectation => {
      if (affectation.id === moduleId) {
        return {
          ...affectation,
          enseignantAffecte: false,
          enseignantId: undefined,
          enseignantNom: undefined,
          enseignantGrade: undefined,
          statut: this.getStatutFromAssignments(affectation.salleAffectee, false)
        };
      }
      return affectation;
    });
    
    this.moduleAffectationsSubject.next(updatedAffectations);
  }

  // Reset all assignments
  resetAllAssignments() {
    const currentAffectations = this.moduleAffectationsSubject.value;
    const resetAffectations = currentAffectations.map(affectation => ({
      ...affectation,
      salleAffectee: false,
      salleId: undefined,
      salleNom: undefined,
      salleCapacite: undefined,
      enseignantAffecte: false,
      enseignantId: undefined,
      enseignantNom: undefined,
      enseignantGrade: undefined,
      statut: 'PENDING' as const
    }));
    
    this.moduleAffectationsSubject.next(resetAffectations);
  }

  // Get current data (for immediate access)
  getCurrentModuleAffectations(): ModuleAffectationData[] {
    return this.moduleAffectationsSubject.value;
  }

  getCurrentSalles(): any[] {
    return this.sallesSubject.value;
  }

  getCurrentEnseignants(): any[] {
    return this.enseignantsSubject.value;
  }
}
