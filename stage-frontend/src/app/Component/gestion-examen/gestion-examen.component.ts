import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { AffectationModuleGroupe, AffectationService } from './../../Service/affectation-service.service';
import { ExamenBesoinsService, ExamenBesoins } from './../../Service/examen-besoins.service';

interface ExamenCalcul {
  id?: number;
  module: string;
  groupes: number;
  classes: number;
  salles: number;
  enseignants: number;
  periode?: string;
  groupeNames?: string[];
  classNames?: string[]; // Added for class names
}

interface PeriodeData {
  periode: string;
  modulesCount: number;
  modules: string[];
  examensCount: number; // Added for better tracking
}

interface ModuleData {
  module: string;
  groupes: number;
  classes: number;
  salles: number;
  enseignants: number;
  groupeNames: string[];
  classNames: string[]; // Added for class names
}

interface NotificationMessage {
  type: 'success' | 'error' | 'info';
  message: string;
  show: boolean;
}

@Component({
  selector: 'app-gestion-examen',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-examen.component.html',
  styleUrls: ['./gestion-examen.component.scss']
})
export class GestionExamenComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Constants
  readonly PERIODES = ['PERIODE_1', 'PERIODE_2', 'PERIODE_3', 'PERIODE_4'] as const;
  readonly CLASSES_PER_GROUP = 2;
  readonly TEACHERS_MULTIPLIER = 1.5;
  
  // Navigation state
  currentView: 'periodes' | 'modules' | 'details' | 'form' = 'periodes';
  selectedPeriode: string = '';
  selectedModule: string = '';
  
  // Loading states
  isLoading = true;
  isProcessing = false;
  
  // Form state
  showForm = false;
  examenForm!: FormGroup;
  availableModules: string[] = [];
  
  // Data
  affectations: AffectationModuleGroupe[] = [];
  examensCalcules: ExamenCalcul[] = [];
  
  // Grid data
  periodesData: PeriodeData[] = [];
  modulesData: ModuleData[] = [];
  moduleDetails: ModuleData | null = null;

  // Notification
  notification: NotificationMessage = {
    type: 'info',
    message: '',
    show: false
  };

  // Expose Math to template
  readonly Math = Math;

  constructor(
    private affectationService: AffectationService,
    private examenBesoinsService: ExamenBesoinsService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initializeData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.examenForm = this.fb.group({
      periode: ['', Validators.required],
      moduleLibelle: ['', Validators.required],
      nombreGroupes: [0, [Validators.required, Validators.min(1)]],
      nombreClasses: [0, [Validators.required, Validators.min(1)]],
      nombreSalles: [0, [Validators.required, Validators.min(1)]],
      nombreEnseignants: [0, [Validators.required, Validators.min(1)]]
    });

    // Auto-calculate dependent fields
    this.examenForm.get('nombreGroupes')?.valueChanges.subscribe(groupes => {
      if (groupes && groupes > 0) {
        const classes = groupes * this.CLASSES_PER_GROUP;
        const salles = classes;
        const enseignants = Math.ceil(classes * this.TEACHERS_MULTIPLIER);
        
        this.examenForm.patchValue({
          nombreClasses: classes,
          nombreSalles: salles,
          nombreEnseignants: enseignants
        }, { emitEvent: false });
      }
    });
  }

  private initializeData(): void {
    this.isLoading = true;
    
    // Load affectations and examens in parallel
    Promise.all([
      this.loadAffectations(),
      this.loadAllExamens()
    ]).finally(() => {
      this.isLoading = false;
      this.buildPeriodesGrid();
      this.updateAvailableModules();
    });
  }

  private loadAffectations(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.affectationService.getAllAffectations()
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            this.showNotification('error', 'Erreur lors du chargement des affectations');
            console.error('Error loading affectations:', error);
            return of([]);
          })
        )
        .subscribe(data => {
          this.affectations = data;
          resolve();
        });
    });
  }

  private loadAllExamens(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.examenBesoinsService.getAll()
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            this.showNotification('error', 'Erreur lors du chargement des examens');
            console.error('Error loading examens:', error);
            return of([]);
          })
        )
        .subscribe(data => {
          this.examensCalcules = this.mapExamenBesoinsToCalcul(data);
          resolve();
        });
    });
  }

  private loadExamensForPeriode(periode: string): void {
    this.examenBesoinsService.getByPeriode(periode)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.showNotification('error', `Erreur lors du chargement des examens pour ${periode}`);
          return of([]);
        })
      )
      .subscribe(data => {
        // Update only examens for this periode
        this.examensCalcules = this.examensCalcules.filter(e => e.periode !== periode);
        this.examensCalcules.push(...this.mapExamenBesoinsToCalcul(data));
        this.buildPeriodesGrid();
        this.updateAvailableModules();
      });
  }

  private mapExamenBesoinsToCalcul(examens: ExamenBesoins[]): ExamenCalcul[] {
    return examens.map(e => ({
      id: e.id,
      module: e.moduleLibelle,
      groupes: e.nombreGroupes,
      classes: e.nombreClasses,
      salles: e.nombreSalles,
      enseignants: e.nombreEnseignants,
      periode: e.periode
    }));
  }

  buildPeriodesGrid(): void {
    this.periodesData = this.PERIODES.map(periode => {
      const modulesForPeriode = this.getModulesForPeriode(periode);
      const examensForPeriode = this.examensCalcules.filter(e => e.periode === periode);
      
      return {
        periode,
        modulesCount: modulesForPeriode.length,
        modules: modulesForPeriode,
        examensCount: examensForPeriode.length
      };
    });
  }

  getModulesForPeriode(periode: string): string[] {
    return Array.from(
      new Set(
        this.affectations
          .filter(a => a.periode === periode)
          .map(a => a.module.libelleModule)
      )
    ).sort(); // Sort alphabetically
  }

  // Updated to use concatenated class names
  getGroupNamesForModule(periode: string, module: string): string[] {
    return this.affectations
      .filter(a => a.periode === periode && a.module.libelleModule === module)
      .map(a => `${a.groupe.niveau}${a.groupe.optionGroupe}${a.groupe.nomClasse}`)
      .sort(); // Sort alphabetically
  }

  getClassNamesForModule(periode: string, module: string): string[] {
    // Generate class names based on groups
    const groupNames = this.getGroupNamesForModule(periode, module);
    const classNames: string[] = [];
    
    groupNames.forEach(groupName => {
      // Generate 2 classes per group: A and B
      classNames.push(`${groupName}-A`);
      classNames.push(`${groupName}-B`);
    });
    
    return classNames.sort();
  }

  private calculateModuleStats(groupNames: string[]) {
    const nombreGroupes = groupNames.length;
    const nombreClasses = nombreGroupes * this.CLASSES_PER_GROUP;
    const nombreSalles = nombreClasses;
    const nombreEnseignants = Math.ceil(nombreClasses * this.TEACHERS_MULTIPLIER);

    return {
      nombreGroupes,
      nombreClasses,
      nombreSalles,
      nombreEnseignants
    };
  }

  private updateAvailableModules(): void {
    this.availableModules = Array.from(
      new Set(
        this.affectations.map(a => a.module.libelleModule)
      )
    ).sort();
  }

  // Navigation methods
  onPeriodeClick(periode: string): void {
    if (this.isProcessing) return;
    
    this.selectedPeriode = periode;
    this.currentView = 'modules';
    this.buildModulesGrid();
  }

  onModuleClick(module: string): void {
    if (this.isProcessing) return;
    
    this.selectedModule = module;
    this.currentView = 'details';
    this.buildModuleDetails();
  }

  buildModulesGrid(): void {
    const modulesForPeriode = this.getModulesForPeriode(this.selectedPeriode);
    
    this.modulesData = modulesForPeriode.map(module => {
      const groupNames = this.getGroupNamesForModule(this.selectedPeriode, module);
      const classNames = this.getClassNamesForModule(this.selectedPeriode, module);
      const stats = this.calculateModuleStats(groupNames);

      return {
        module,
        groupes: stats.nombreGroupes,
        classes: stats.nombreClasses,
        salles: stats.nombreSalles,
        enseignants: stats.nombreEnseignants,
        groupeNames: groupNames,
        classNames: classNames
      };
    });
  }

  buildModuleDetails(): void {
    const groupNames = this.getGroupNamesForModule(this.selectedPeriode, this.selectedModule);
    const classNames = this.getClassNamesForModule(this.selectedPeriode, this.selectedModule);
    const stats = this.calculateModuleStats(groupNames);

    this.moduleDetails = {
      module: this.selectedModule,
      groupes: stats.nombreGroupes,
      classes: stats.nombreClasses,
      salles: stats.nombreSalles,
      enseignants: stats.nombreEnseignants,
      groupeNames: groupNames,
      classNames: classNames
    };
  }

  // Navigation back
  goBackToPeriodes(): void {
    this.currentView = 'periodes';
    this.selectedPeriode = '';
    this.selectedModule = '';
    this.moduleDetails = null;
    this.showForm = false;
  }

  goBackToModules(): void {
    this.currentView = 'modules';
    this.selectedModule = '';
    this.moduleDetails = null;
    this.showForm = false;
  }

  // Form methods
  showAddForm(): void {
    this.showForm = true;
    this.currentView = 'form';
    this.examenForm.reset();
  }

  hideForm(): void {
    this.showForm = false;
    this.currentView = 'periodes';
    this.examenForm.reset();
  }

  onPeriodeChange(): void {
    const selectedPeriode = this.examenForm.get('periode')?.value;
    if (selectedPeriode) {
      // Update available modules for the selected periode
      const modulesForPeriode = this.getModulesForPeriode(selectedPeriode);
      this.availableModules = modulesForPeriode;
      
      // Reset module selection
      this.examenForm.patchValue({ moduleLibelle: '' });
    }
  }

  onModuleChange(): void {
    const selectedPeriode = this.examenForm.get('periode')?.value;
    const selectedModule = this.examenForm.get('moduleLibelle')?.value;
    
    if (selectedPeriode && selectedModule) {
      // Auto-calculate based on existing affectations
      const groupNames = this.getGroupNamesForModule(selectedPeriode, selectedModule);
      const stats = this.calculateModuleStats(groupNames);
      
      this.examenForm.patchValue({
        nombreGroupes: stats.nombreGroupes,
        nombreClasses: stats.nombreClasses,
        nombreSalles: stats.nombreSalles,
        nombreEnseignants: stats.nombreEnseignants
      });
    }
  }

  onSubmitForm(): void {
    if (this.examenForm.valid && !this.isProcessing) {
      const formValue = this.examenForm.value;
      
      // Check if module already exists
      if (this.examensCalcules.some(e => 
        e.module === formValue.moduleLibelle && e.periode === formValue.periode)) {
        this.showNotification('info', 'Ce module est déjà ajouté pour cette période');
        return;
      }

      this.isProcessing = true;

      const examenBesoins: ExamenBesoins = {
        moduleLibelle: formValue.moduleLibelle,
        periode: formValue.periode,
        nombreGroupes: formValue.nombreGroupes,
        nombreClasses: formValue.nombreClasses,
        nombreSalles: formValue.nombreSalles,
        nombreEnseignants: formValue.nombreEnseignants
      };

      this.examenBesoinsService.save(examenBesoins)
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            this.showNotification('error', 'Erreur lors de l\'ajout du module');
            console.error('Error saving exam:', error);
            return of(null);
          })
        )
        .subscribe(result => {
          this.isProcessing = false;
          if (result) {
            this.showNotification('success', `Module "${formValue.moduleLibelle}" ajouté avec succès`);
            this.loadExamensForPeriode(formValue.periode);
            this.hideForm();
          }
        });
    } else {
      this.showNotification('error', 'Veuillez remplir tous les champs requis');
    }
  }

  // CRUD operations
  ajouterModule(module: string): void {
    if (!this.selectedPeriode || !module || this.isProcessing) {
      return;
    }

    // Check if module already exists
    if (this.isModuleAdded(module)) {
      this.showNotification('info', 'Ce module est déjà ajouté pour cette période');
      return;
    }

    this.isProcessing = true;
    const groupNames = this.getGroupNamesForModule(this.selectedPeriode, module);
    const stats = this.calculateModuleStats(groupNames);

    const examenBesoins: ExamenBesoins = {
      moduleLibelle: module,
      periode: this.selectedPeriode,
      nombreGroupes: stats.nombreGroupes,
      nombreClasses: stats.nombreClasses,
      nombreSalles: stats.nombreSalles,
      nombreEnseignants: stats.nombreEnseignants
    };

    this.examenBesoinsService.save(examenBesoins)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.showNotification('error', 'Erreur lors de l\'ajout du module');
          console.error('Error saving exam:', error);
          return of(null);
        })
      )
      .subscribe(result => {
        this.isProcessing = false;
        if (result) {
          this.showNotification('success', `Module "${module}" ajouté avec succès`);
          this.loadExamensForPeriode(this.selectedPeriode);
        }
      });
  }

  supprimerModule(module: string, periode: string): void {
    if (this.isProcessing) return;

    const item = this.examensCalcules.find(e => e.module === module && e.periode === periode);
    if (!item?.id) {
      this.showNotification('error', 'Impossible de supprimer: examen non trouvé');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer le module "${module}" de la période "${periode}" ?`)) {
      return;
    }

    this.isProcessing = true;

    this.examenBesoinsService.delete(item.id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.showNotification('error', 'Erreur lors de la suppression du module');
          console.error('Error deleting exam:', error);
          return of(false);
        })
      )
      .subscribe(success => {
        this.isProcessing = false;
        if (success !== false) {
          this.showNotification('success', `Module "${module}" supprimé avec succès`);
          this.loadExamensForPeriode(periode);
        }
      });
  }

  // Helper methods
  calculateEnseignants(classes: number): number {
    return Math.ceil(classes * this.TEACHERS_MULTIPLIER);
  }

  isModuleAdded(module: string): boolean {
    return this.examensCalcules.some(e => 
      e.module === module && e.periode === this.selectedPeriode
    );
  }

  trackByExamen(index: number, item: ExamenCalcul): any {
    return item.id || `${item.module}-${item.periode}`;
  }

  trackByPeriode(index: number, item: PeriodeData): string {
    return item.periode;
  }

  trackByModule(index: number, item: ModuleData): string {
    return `${item.module}-${this.selectedPeriode}`;
  }

  trackByGroup(index: number, groupe: string): string {
    return groupe;
  }

  // Notification system
  private showNotification(type: NotificationMessage['type'], message: string): void {
    this.notification = { type, message, show: true };
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 4000);
  }

  hideNotification(): void {
    this.notification.show = false;
  }

  // Utility methods
  getTotalStats() {
    return this.examensCalcules.reduce((totals, exam) => ({
      totalGroupes: totals.totalGroupes + exam.groupes,
      totalClasses: totals.totalClasses + exam.classes,
      totalSalles: totals.totalSalles + exam.salles,
      totalEnseignants: totals.totalEnseignants + exam.enseignants
    }), {
      totalGroupes: 0,
      totalClasses: 0,
      totalSalles: 0,
      totalEnseignants: 0
    });
  }

  getExamensForPeriode(periode: string): ExamenCalcul[] {
    return this.examensCalcules.filter(e => e.periode === periode);
  }
}