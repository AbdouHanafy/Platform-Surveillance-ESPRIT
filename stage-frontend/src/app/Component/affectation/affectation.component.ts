import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AffectationModuleGroupe, AffectationRequestDTO, AffectationService } from './../../Service/affectation-service.service';
import { EmploiDuTempsService } from './../../Service/emploi-du-temps.service';
import { EnseignantService } from './../../Service/enseignant-service.service';
import { Groupe } from '../../Entity/Groupe';




@Component({
  selector: 'app-affectation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './affectation.component.html',
  styleUrls: ['./affectation.component.scss']
})
export class AffectationComponent implements OnInit {
  modules: any[] = [];

  groupes: Groupe[] = [];
  filteredGroupes: Groupe[] = [];

  affectations: AffectationModuleGroupe[] = [];

  selectedModuleId: number | null = null;

  optionsGroupe: string[] = [];
  selectedOptionGroupe: string | null = null;

  selectedGroupeIds: number[] = [];
  selectedPeriode: string = 'PERIODE_1';

  periodes = ['PERIODE_1', 'PERIODE_2', 'PERIODE_3', 'PERIODE_4'];

  constructor(
    private affectationService: AffectationService,
    private EmploiDuTempsService: EmploiDuTempsService,
    private EnseignantService: EnseignantService
  ) {}

  ngOnInit(): void {
    this.loadModules();
    this.loadGroupes();
    this.loadAffectations();
  }



  loadModules() {
    this.EnseignantService.getAllModules().subscribe(data => {
      this.modules = data;
      console.log("Modules chargés:", this.modules);
    });
  }

  loadGroupes() {
    this.EmploiDuTempsService.getAllGroupes().subscribe(data => {
      this.groupes = data;

      // Extraire les options uniques
      this.optionsGroupe = Array.from(new Set(this.groupes.map(g => g.optionGroupe)));

      this.selectedOptionGroupe = this.optionsGroupe.length > 0 ? this.optionsGroupe[0] : null;

      this.filterGroupes();
    });
  }

  filterGroupes() {
    if (this.selectedOptionGroupe) {
      this.filteredGroupes = this.groupes.filter(g => g.optionGroupe === this.selectedOptionGroupe);
    } else {
      this.filteredGroupes = [...this.groupes];
    }
    this.selectedGroupeIds = [];
  }
getDisplayClassName(groupe: Groupe): string {
  return `${groupe.niveau}${groupe.optionGroupe}${groupe.nomClasse}`;
}


onOptionGroupeChange(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  this.selectedOptionGroupe = selectElement.value;
  this.filterGroupes();
  
}


  affecter() {
    console.log('selectedModuleId:', this.selectedModuleId);
    console.log('selectedGroupeIds:', this.selectedGroupeIds);
    console.log('selectedPeriode:', this.selectedPeriode);

    if (!this.selectedModuleId || this.selectedGroupeIds.length === 0 || !this.selectedPeriode) {
      Swal.fire('⚠️ Attention', 'Veuillez sélectionner un module, au moins un groupe, et une période.', 'warning');
      return;
    }

    const request: AffectationRequestDTO = {
      moduleId: this.selectedModuleId,
      groupeIds: this.selectedGroupeIds,
      periode: this.selectedPeriode
    };

    this.affectationService.affecterModuleAGroupes(request).subscribe({
      next: res => {
        Swal.fire('✅ Succès', res, 'success');
        this.loadAffectations();
        this.selectedGroupeIds = [];
      },
      error: () => {
        Swal.fire('❌ Erreur', 'Une erreur est survenue lors de l\'affectation.', 'error');
      }
    });
  }

  loadAffectations() {
    this.affectationService.getAllAffectations().subscribe(data => {
      this.affectations = data;
    });
  }

  deleteAffectation(id: number) {
    this.affectationService.deleteAffectation(id).subscribe(() => {
      Swal.fire('🗑️ Supprimé', 'Affectation supprimée avec succès.', 'info');
      this.loadAffectations();
    });
  }

  
}
