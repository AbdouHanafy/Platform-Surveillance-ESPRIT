import { Component, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { EnseignantService } from '../../Service/enseignant-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EnseignantAvecModules } from '../../Entity/EnseignantAvecModules';
import { Subject, takeUntil, finalize } from 'rxjs';
import { MyModule } from '../../Entity/module.model';
import { Enseignant } from '../../Entity/Enseignant';
import { UnitePedagogique } from '../../Entity/unite-pedagogique.model';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ModulesComponent implements OnInit, OnDestroy {
  showForm: boolean = false;
  isLoading: boolean = false;
  isAssigning: boolean = false;

  enseignants: Enseignant[] = [];
  modules: MyModule[] = [];
  enseignantsAvecModules: EnseignantAvecModules[] = [];
  showAssignModal: boolean = false;
showEditModal: boolean = false;
  
  selectedEnseignantId: number | null = null;
  selectedModuleIds: number[] = [];
  
    roleUtilisateur: string = '';
    userId: number | null = null;

// Nouvelle section
unites: UnitePedagogique[] = [];
selectedUniteId: number | null = null;

enseignantsFiltres: Enseignant[] = [];
modulesFiltres: MyModule[] = [];
modulesHorsUPFiltres: MyModule[] = [];


onUniteChange(selectedId: number | null): void {
  // Convertir selectedId en number ou null si nécessaire
  this.selectedUniteId = selectedId !== null ? Number(selectedId) : null;

  console.log('Selected UP id:', this.selectedUniteId);

  if (!this.selectedUniteId) {
    this.enseignantsFiltres = [...this.enseignants];
    this.modulesFiltres = [...this.modules];
    this.modulesHorsUPFiltres = [];
  } else {
    this.enseignantsFiltres = this.enseignants.filter(ens => ens.unitePedagogique?.id === this.selectedUniteId);
    this.modulesFiltres = this.modules.filter(mod => mod.unitePedagogique?.id === this.selectedUniteId);
    this.modulesHorsUPFiltres = this.modules.filter(mod => mod.unitePedagogique?.id !== this.selectedUniteId);
  }

  console.log('Enseignants filtrés:', this.enseignantsFiltres);

  if (this.selectedEnseignantId && !this.enseignantsFiltres.some(e => e.id === this.selectedEnseignantId)) {
    this.selectedEnseignantId = null;
  }

  this.selectedModuleIds = [];
}


private loadUnites(): Promise<void> {
  return new Promise((resolve, reject) => {
    this.enseignantService.getAllUnites()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.unites = data || [];
          resolve();
        },
        error: (err) => {
          this.showErrorAlert('Erreur lors du chargement des unités pédagogiques');
          reject(err);
        }
      });
  });
}

// Ouvrir modal affectation (ajout)
openAssignModal(): void {
  this.resetForm();
  this.showAssignModal = true;
  this.showEditModal = false;
}
openEditModal(enseignantId: number): void {
  this.selectedEnseignantId = enseignantId;
  const enseignant = this.enseignantsAvecModules.find(ens => ens.id === enseignantId);
  if (enseignant && enseignant.modules) {
    this.selectedModuleIds = enseignant.modules.map(mod => mod.id);
  } else {
    this.selectedModuleIds = [];
  }
  this.showEditModal = true;
  this.showAssignModal = false;
}

// Fermeture modals
closeAssignModal(): void {
  this.showAssignModal = false;
  this.resetForm();
}

closeEditModal(): void {
  this.showEditModal = false;
  this.resetForm();
}

// Reset form commun

  // Pour suppression modules
  showDeleteModulesForm: boolean = false;
  enseignantModulesToDelete: MyModule[] = [];
  enseignantIdForDeletion: number | null = null;
  selectedModulesToDelete: number[] = [];

  private destroy$ = new Subject<void>();

  constructor(private enseignantService: EnseignantService) {}


/*******  f9082c22-2d78-426c-81a9-786cbbc7d502  *******/
  ngOnInit(): void {
     this.roleUtilisateur = localStorage.getItem('role') || '';
  const id = localStorage.getItem('id');
  this.userId = id ? Number(id) : null;
    this.initializeData();
    
  }
get enseignantsAffiches(): EnseignantAvecModules[] {
  if (this.roleUtilisateur === 'ENSEIGNANT' && this.userId != null) {
    return this.enseignantsAvecModules.filter(e => e.id === this.userId);
  }
  // SUPER_ADMIN et ADMIN voient tout
  return this.enseignantsAvecModules;
}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeData(): void {
  this.isLoading = true;
  Promise.all([
    this.loadEnseignants(),
    this.loadModules(),
    this.loadEnseignantsAvecModules(),
    this.loadUnites()  // Ajouté ici
  ]).finally(() => {
    this.isLoading = false;
  });
}


private loadEnseignants(): Promise<void> {
  return new Promise((resolve, reject) => {
    this.enseignantService.getAllEnseignants()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.enseignants = data || [];
          this.onUniteChange // <== Ici, juste après avoir mis à jour enseignants
          resolve();
        },
        error: (err) => {
          this.showErrorAlert('Erreur lors du chargement des enseignants');
          reject(err);
        }
      });
  });
}


  private loadModules(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.enseignantService.getAllModules()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.modules = data || [];
            resolve();
          },
          error: (err) => {
            this.showErrorAlert('Erreur lors du chargement des modules');
            reject(err);
          }
        });
    });
  }

 loadEnseignantsAvecModules(): Promise<void> {
  return new Promise((resolve, reject) => {
    this.enseignantService.getEnseignantsAvecModules()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.enseignantsAvecModules = data || [];
          // Tri alphabétique par nom enseignant pour garder l'ordre stable
          this.enseignantsAvecModules.sort((a, b) => a.nom.localeCompare(b.nom));
          resolve();
        },
        error: (err) => {
          this.showErrorAlert('Erreur lors du chargement des affectations');
          reject(err);
        }
      });
  });
}

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.selectedEnseignantId = null;
    this.selectedModuleIds = [];
  }
get modulesDansUP(): MyModule[] {
  if (!this.selectedEnseignantId) return [];
  const enseignant = this.enseignants.find(e => e.id === this.selectedEnseignantId);
  if (!enseignant || !enseignant.unitePedagogique) return [];

  return this.modules.filter(mod => mod.unitePedagogique?.id === enseignant.unitePedagogique?.id);
}

get modulesHorsUP(): MyModule[] {
  if (!this.selectedEnseignantId) return [];
  const enseignant = this.enseignants.find(e => e.id === this.selectedEnseignantId);
  if (!enseignant || !enseignant.unitePedagogique) return [];

  return this.modules.filter(mod => mod.unitePedagogique?.id !== enseignant.unitePedagogique?.id);
}


  toggleModuleSelection(moduleId: number, checked: boolean): void {
    if (checked) {
      if (!this.selectedModuleIds.includes(moduleId)) {
        this.selectedModuleIds.push(moduleId);
      }
    } else {
      this.selectedModuleIds = this.selectedModuleIds.filter(id => id !== moduleId);
    }
  }

  affecterModules(): void {
    if (!this.selectedEnseignantId) {
      this.showErrorAlert('Veuillez sélectionner un enseignant');
      return;
    }
    if (this.selectedModuleIds.length === 0) {
      this.showErrorAlert('Veuillez sélectionner au moins un module');
      return;
    }

 const enseignant = this.enseignantsAvecModules.find(e => e.id === Number(this.selectedEnseignantId));

    if (!enseignant) {
      this.showErrorAlert('Enseignant introuvable');
      return;
    }

    const selectedModules = this.modules.filter(mod => this.selectedModuleIds.includes(mod.id));
    const modulesHorsUP = selectedModules.filter(mod => mod.unitePedagogique.id !== enseignant.unitePedagogique?.id);

    if (modulesHorsUP.length > 0) {
      const horsUPNames = modulesHorsUP.map(m => m.libelleModule).join(', ');
      this.showInfoAlert(`Attention: Les modules suivants ne font pas partie de l'unité pédagogique de l'enseignant: ${horsUPNames}`);
    }

    Swal.fire({
      title: 'Confirmer l\'affectation',
      text: `Voulez-vous affecter ${this.selectedModuleIds.length} module(s) à ${enseignant.nom} ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, affecter',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444'
    }).then(result => {
      if (result.isConfirmed) {
        this.performAssignment();
      }
    });
  }

  private performAssignment(): void {
    this.isAssigning = true;
    if (!this.selectedEnseignantId) {
      this.isAssigning = false;
      return;
    }

    const payload = {
      enseignantId: this.selectedEnseignantId,
      moduleIds: this.selectedModuleIds
    };

    this.enseignantService.affecterModules(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isAssigning = false)
      )
      .subscribe({
        next: () => {
          this.showSuccessAlert('Modules affectés avec succès');
          this.resetForm();
          this.toggleForm();
          this.loadEnseignantsAvecModules();
        },
        error: () => {
          this.showErrorAlert('Erreur lors de l\'affectation des modules');
        }
      });
  }

  editEnseignantModules(enseignantId: number): void {
    this.selectedEnseignantId = enseignantId;
    const enseignant = this.enseignantsAvecModules.find(ens => ens.id === enseignantId);
    if (enseignant && enseignant.modules) {
      this.selectedModuleIds = enseignant.modules.map(mod => mod.id);
    }
    this.showForm = true;
  }

  // *********************** Suppression Modules ***********************

  openDeleteModulesForm(enseignantId: number): void {
    this.enseignantIdForDeletion = enseignantId;
    const enseignant = this.enseignantsAvecModules.find(e => e.id === enseignantId);
    if (enseignant && enseignant.modules) {
      this.enseignantModulesToDelete = enseignant.modules;
      this.selectedModulesToDelete = [];
      this.showDeleteModulesForm = true;
    } else {
      this.showInfoAlert('Aucun module à supprimer pour cet enseignant');
    }
  }

  closeDeleteModulesForm(): void {
    this.showDeleteModulesForm = false;
    this.enseignantModulesToDelete = [];
    this.selectedModulesToDelete = [];
    this.enseignantIdForDeletion = null;
  }

  toggleModuleToDelete(moduleId: number, checked: boolean): void {
    if (checked) {
      if (!this.selectedModulesToDelete.includes(moduleId)) {
        this.selectedModulesToDelete.push(moduleId);
      }
    } else {
      this.selectedModulesToDelete = this.selectedModulesToDelete.filter(id => id !== moduleId);
    }
  }

async confirmDeleteSelectedModules(): Promise<void> {
  if (!this.enseignantIdForDeletion) return;
  if (this.selectedModulesToDelete.length === 0) {
    this.showErrorAlert('Veuillez sélectionner au moins un module à supprimer');
    return;
  }

  const result = await Swal.fire({
    title: 'Confirmer la suppression',
    text: `Voulez-vous supprimer ${this.selectedModulesToDelete.length} module(s) de cet enseignant ?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler',
    confirmButtonColor: '#ef4444',
  });

  if (result.isConfirmed) {
    this.isLoading = true;
    try {
      for (const moduleId of this.selectedModulesToDelete) {
        await this.enseignantService.supprimerModuleAffecte(this.enseignantIdForDeletion!, moduleId).toPromise();
      }
      this.showSuccessAlert('Modules supprimés avec succès');
      this.closeDeleteModulesForm();
      await this.loadEnseignantsAvecModules();
    } catch (error) {
      this.showErrorAlert('Erreur lors de la suppression des modules');
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
}


  getTotalAffectations(): number {
    return this.enseignantsAvecModules.reduce((total, ens) => {
      return total + (ens.modules?.length || 0);
    }, 0);
  }

  trackByEnseignantId(index: number, enseignant: EnseignantAvecModules): number {
    return enseignant.id;
  }

  trackByModuleId(index: number, module: MyModule): number {
    return module.id;
  }

  trackByModuleLibelle(index: number, module: MyModule): string {
    return module.libelleModule;
  }

  private showSuccessAlert(message: string): void {
    Swal.fire({
      title: 'Succès',
      text: message,
      icon: 'success',
      confirmButtonColor: '#10b981',
      timer: 3000,
      timerProgressBar: true
    });
  }

  private showErrorAlert(message: string): void {
    Swal.fire({
      title: 'Erreur',
      text: message,
      icon: 'error',
      confirmButtonColor: '#ef4444'
    });
  }

  private showInfoAlert(message: string): void {
    Swal.fire({
      title: 'Information',
      text: message,
      icon: 'info',
      confirmButtonColor: '#3b82f6'
    });
  }

  
}
