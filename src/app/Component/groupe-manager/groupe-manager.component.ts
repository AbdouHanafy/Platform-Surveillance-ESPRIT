import { Component, OnInit } from '@angular/core';
import { Groupe } from '../../Entity/Groupe';
import { ModuleServiceService } from '../../Service/module-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-groupe-manager',
  imports: [CommonModule , ReactiveFormsModule,FormsModule],
  templateUrl: './groupe-manager.component.html',
  styleUrl: './groupe-manager.component.scss'
})
export class GroupeManagerComponent implements OnInit {
  groupes: Groupe[] = [];
  groupeForm: Groupe = {
    nomClasse: '',
    niveau: '',
    optionGroupe: '',
    effectif: 0,
    departement: ''
  };
  isEditing = false;
  showForm = false;

  constructor(private groupeService: ModuleServiceService) {}

  ngOnInit(): void {
    this.loadGroupes();
  }

  loadGroupes(): void {
    this.groupeService.getAllGroupes().subscribe(data => this.groupes = data);
  }

  // Generate the display name by concatenating niveau + option + nomClasse
  getDisplayClassName(groupe: Groupe): string {
    return `${groupe.niveau}${groupe.optionGroupe}${groupe.nomClasse}`;
  }

  saveGroupe(): void {
    if (this.isEditing && this.groupeForm.id) {
      this.groupeService.updateGroupe(this.groupeForm.id, this.groupeForm).subscribe(() => {
        this.loadGroupes();
        this.resetForm();
      });
    } else {
      this.groupeService.createGroupe(this.groupeForm).subscribe(() => {
        this.loadGroupes();
        this.resetForm();
      });
    }
  }

  editGroupe(groupe: Groupe): void {
    this.groupeForm = { ...groupe };
    this.isEditing = true;
    this.showForm = true;
  }

  deleteGroupe(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce groupe ?')) {
      this.groupeService.deleteGroupe(id).subscribe(() => this.loadGroupes());
    }
  }

  resetForm(): void {
    this.groupeForm = {
      nomClasse: '',
      niveau: '',
      optionGroupe: '',
      effectif: 0,
      departement: ''
    };
    this.isEditing = false;
    this.showForm = false;
  }

  openAddForm(): void {
    this.resetForm();
    this.showForm = true;
  }

  closeForm(): void {
    this.resetForm();
  }

  trackByGroupeId(index: number, groupe: Groupe): any {
    return groupe.id || index;
  }

  // Group groupes by option
  get groupedGroupes(): { [key: string]: Groupe[] } {
    return this.groupes.reduce((groups, groupe) => {
      const option = groupe.optionGroupe || 'AUTRES';
      if (!groups[option]) {
        groups[option] = [];
      }
      groups[option].push(groupe);
      return groups;
    }, {} as { [key: string]: Groupe[] });
  }

  // Get array of option keys for iteration
  get optionKeys(): string[] {
    return Object.keys(this.groupedGroupes).sort();
  }

  // Toggle group visibility
  expandedGroups: { [key: string]: boolean } = {};

  toggleGroup(option: string): void {
    this.expandedGroups[option] = !this.expandedGroups[option];
  }

  isGroupExpanded(option: string): boolean {
    return this.expandedGroups[option] || false;
  }
}