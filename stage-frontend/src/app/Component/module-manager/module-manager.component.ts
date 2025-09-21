import { EnseignantService } from './../../Service/enseignant-service.service';
import { Component } from '@angular/core';
import { MyModule } from '../../Entity/module.model';
import { ModuleServiceService } from '../../Service/module-service.service';
import { UnitePedagogique } from '../../Entity/unite-pedagogique.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-module-manager',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './module-manager.component.html',
  styleUrl: './module-manager.component.scss'
})
export class ModuleManagerComponent {
  modules: MyModule[] = [];
  unites: UnitePedagogique[] = [];
  filteredModules: MyModule[] = [];
  selectedUniteId: number = 0;
  
  newModule: MyModule = {
    id: 0,
    codeModule: '',
    libelleModule: '',
    unitePedagogique: {
      id: 0,
      libelle: ''
    }
  };
  
  selectedFile: File | null = null;
  message = '';
  showAddForm = false;
  showImportSection = false;
  
  constructor(
    private moduleService: ModuleServiceService, 
    private enseignantService: EnseignantService
  ) {}

  ngOnInit(): void {
    this.loadModules();
    this.loadUnites();
  }

  loadModules(): void {
    this.moduleService.getAll().subscribe({
      next: (data) => {
        this.modules = data;
        this.filteredModules = data;
      },
      error: (err) => console.error(err),
    });
  }

  loadUnites(): void {
    this.enseignantService.getAllUnites().subscribe({
      next: (data) => (this.unites = data),
      error: (err) => console.error(err),
    });
  }

  filterModulesByUnite(uniteId: number): void {
    this.selectedUniteId = uniteId;
    if (uniteId === 0) {
      this.filteredModules = this.modules;
    } else {
      this.filteredModules = this.modules.filter(m => m.unitePedagogique.id === uniteId);
    }
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.resetForm();
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newModule = {
      id: 0,
      codeModule: '',
      libelleModule: '',
      unitePedagogique: {
        id: 0,
        libelle: ''
      }
    };
  }

  createModule(): void {
    if (
      !this.newModule.codeModule ||
      !this.newModule.libelleModule ||
      !this.newModule.unitePedagogique?.id
    ) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.moduleService.create(this.newModule).subscribe({
      next: () => {
        this.loadModules();
        this.closeAddForm();
        this.message = 'Module ajouté avec succès!';
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        console.error(err);
        this.message = 'Erreur lors de l\'ajout du module';
      }
    });
  }

  deleteModule(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce module ?')) {
      this.moduleService.delete(id).subscribe(() => {
        this.loadModules();
        this.message = 'Module supprimé avec succès!';
        setTimeout(() => this.message = '', 3000);
      });
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  importExcel(): void {
    if (!this.selectedFile) {
      alert('Veuillez sélectionner un fichier Excel');
      return;
    }
    
    this.moduleService.importExcel(this.selectedFile!).subscribe({
      next: (importedModules) => {
        this.message = `Import réussi: ${importedModules.length} modules ajoutés.`;
        this.loadModules();
        this.selectedFile = null;
        setTimeout(() => this.message = '', 5000);
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.message = err.error.message;
        } else {
          this.message = 'Erreur lors de l\'import.';
        }
        console.error(err);
      }
    });
  }

  toggleImportSection(): void {
    this.showImportSection = !this.showImportSection;
  }

  getModuleCountByUnite(uniteId: number): number {
    return this.modules.filter(m => m.unitePedagogique.id === uniteId).length;
  }

  trackByModuleId(index: number, module: MyModule): number {
    return module.id || index;
  }
}