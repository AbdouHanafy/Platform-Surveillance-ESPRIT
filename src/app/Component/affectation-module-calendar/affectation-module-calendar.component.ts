import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AffectationModuleGroupe, AffectationService } from '../../Service/affectation-service.service';
import { EmploiDuTempsService } from '../../Service/emploi-du-temps.service';
import { EnseignantService } from '../../Service/enseignant-service.service';
import { SalleService } from '../../Service/salle-service.service';
import { SharedAffectationService, ModuleAffectationData } from '../../Service/shared-affectation.service';

@Component({
  selector: 'app-affectation-module-calendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './affectation-module-calendar.component.html',
  styleUrls: ['./affectation-module-calendar.component.scss']
})
export class AffectationModuleCalendarComponent implements OnInit {
  affectations: ModuleAffectationData[] = [];
  isAssigning = false;

  constructor(
    private affectationService: AffectationService,
    private emploiDuTempsService: EmploiDuTempsService,
    private enseignantService: EnseignantService,
    private salleService: SalleService,
    private sharedAffectationService: SharedAffectationService
  ) {}

  ngOnInit(): void {
    this.subscribeToSharedData();
  }

  // Subscribe to shared data for synchronization
  subscribeToSharedData() {
    this.sharedAffectationService.moduleAffectations$.subscribe(data => {
      this.affectations = data;
      console.log('Module calendar - Affectations updated from shared service:', data);
    });
  }

  // Bulk assignment methods (same as other components)
  assignAllSallesRandomly() {
    this.isAssigning = true;
    this.sharedAffectationService.assignAllSallesRandomly().subscribe({
      next: (result) => {
        this.isAssigning = false;
        Swal.fire({
          title: '✅ Salles Affectées',
          text: `${result.success} salle(s) affectée(s) sur ${result.total} module(s).`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
      error: (error) => {
        this.isAssigning = false;
        Swal.fire('❌ Erreur', error, 'error');
      }
    });
  }

  assignAllEnseignantsRandomly() {
    this.isAssigning = true;
    this.sharedAffectationService.assignAllEnseignantsRandomly().subscribe({
      next: (result) => {
        this.isAssigning = false;
        Swal.fire({
          title: '✅ Enseignants Affectés',
          text: `${result.success} enseignant(s) affecté(s) sur ${result.total} module(s).`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
      error: (error) => {
        this.isAssigning = false;
        Swal.fire('❌ Erreur', error, 'error');
      }
    });
  }

  resetAllAssignments() {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Cette action supprimera TOUTES les affectations (salles et enseignants).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, tout réinitialiser',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.sharedAffectationService.resetAllAssignments();
        Swal.fire('🔄 Réinitialisé', 'Toutes les affectations ont été supprimées.', 'info');
      }
    });
  }

  // Helper methods (same as affectation component)
  getDisplayClassName(groupe: any): string {
    return `${groupe.niveau}${groupe.optionGroupe}${groupe.nomClasse}`;
  }

  getStatusClass(statut: string): string {
    switch(statut) {
      case 'FULLY_ASSIGNED': return 'status-complete';
      case 'SALLE_ASSIGNED': return 'status-salle';
      case 'ENSEIGNANT_ASSIGNED': return 'status-enseignant';
      default: return 'status-pending';
    }
  }

  getStatusLabel(statut: string): string {
    switch(statut) {
      case 'FULLY_ASSIGNED': return 'Complet';
      case 'SALLE_ASSIGNED': return 'Salle OK';
      case 'ENSEIGNANT_ASSIGNED': return 'Enseignant OK';
      default: return 'En attente';
    }
  }

  getRowClass(statut: string): string {
    switch(statut) {
      case 'FULLY_ASSIGNED': return 'row-complete';
      case 'SALLE_ASSIGNED': return 'row-salle';
      case 'ENSEIGNANT_ASSIGNED': return 'row-enseignant';
      default: return 'row-pending';
    }
  }

  // Progress methods
  getProgressPercentage(affectation: ModuleAffectationData): number {
    let progress = 0;
    if (affectation.salleAffectee) progress += 50;
    if (affectation.enseignantAffecte) progress += 50;
    return progress;
  }

  getProgressText(affectation: ModuleAffectationData): string {
    if (affectation.salleAffectee && affectation.enseignantAffecte) return 'Complet';
    if (affectation.salleAffectee) return 'Salle OK';
    if (affectation.enseignantAffecte) return 'Enseignant OK';
    return 'En attente';
  }

  // Global statistics
  getSallesAssignedCount(): number {
    return this.affectations.filter(a => a.salleAffectee).length;
  }

  getEnseignantsAssignedCount(): number {
    return this.affectations.filter(a => a.enseignantAffecte).length;
  }

  getFullyAssignedCount(): number {
    return this.affectations.filter(a => a.salleAffectee && a.enseignantAffecte).length;
  }

  getGlobalProgressRate(): number {
    if (this.affectations.length === 0) return 0;
    return Math.round((this.getFullyAssignedCount() / this.affectations.length) * 100);
  }
}