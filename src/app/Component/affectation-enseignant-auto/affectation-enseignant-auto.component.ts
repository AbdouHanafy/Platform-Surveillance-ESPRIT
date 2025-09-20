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
  selector: 'app-affectation-enseignant-auto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './affectation-enseignant-auto.component.html',
  styleUrls: ['./affectation-enseignant-auto.component.scss']
})
export class AffectationEnseignantAutoComponent implements OnInit {
  affectations: ModuleAffectationData[] = [];
  enseignants: any[] = [];
  isAssigning = false;

  constructor(
    private affectationService: AffectationService,
    private emploiDuTempsService: EmploiDuTempsService,
    private enseignantService: EnseignantService,
    private salleService: SalleService,
    private sharedAffectationService: SharedAffectationService
  ) {}

  ngOnInit(): void {
    this.loadEnseignants();
    this.subscribeToSharedData();
  }

  // Subscribe to shared data for synchronization
  subscribeToSharedData() {
    this.sharedAffectationService.moduleAffectations$.subscribe(data => {
      this.affectations = data;
      console.log('Affectations updated from shared service:', data);
    });
  }

  loadEnseignants() {
    this.enseignantService.getAllEnseignants().subscribe(data => {
      this.enseignants = data;
      console.log("Enseignants chargés:", this.enseignants);
    });
  }

  // One-click assign ALL enseignants randomly
  assignAllEnseignantsRandomly() {
    if (this.enseignants.length === 0) {
      Swal.fire('❌ Erreur', 'Aucun enseignant disponible dans le système.', 'error');
      return;
    }

    const unassignedCount = this.affectations.filter(a => !a.enseignantAffecte).length;
    if (unassignedCount === 0) {
      Swal.fire('ℹ️ Information', 'Tous les enseignants sont déjà affectés.', 'info');
      return;
    }

    Swal.fire({
      title: '👨‍🏫 Affecter TOUS les Enseignants',
      text: `Voulez-vous affecter aléatoirement des enseignants à ${unassignedCount} module(s) non assigné(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, affecter tout',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.performBulkEnseignantAssignment();
      }
    });
  }

  performBulkEnseignantAssignment() {
    this.isAssigning = true;

    this.sharedAffectationService.assignAllEnseignantsRandomly().subscribe({
      next: (result) => {
        this.isAssigning = false;
        Swal.fire({
          title: '✅ Affectation Terminée',
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

  // Individual assignment for single module
  assignEnseignantToModule(affectation: ModuleAffectationData) {
    if (this.enseignants.length === 0) {
      Swal.fire('❌ Erreur', 'Aucun enseignant disponible.', 'error');
      return;
    }

    // Choose random enseignant
    const randomEnseignant = this.enseignants[Math.floor(Math.random() * this.enseignants.length)];

    // Update via shared service
    this.sharedAffectationService.assignEnseignantToModule(
      affectation.id,
      randomEnseignant.id,
      `${randomEnseignant.nom} ${randomEnseignant.prenom}`,
      randomEnseignant.grade
    );

    Swal.fire({
      title: '✅ Enseignant Affecté',
      html: `
        <div style="text-align: left;">
          <p><strong>Module:</strong> ${affectation.module.libelleModule}</p>
          <p><strong>Groupe:</strong> ${this.getDisplayClassName(affectation.groupe)}</p>
          <p><strong>Enseignant assigné:</strong> ${randomEnseignant.nom} ${randomEnseignant.prenom}</p>
          <p><strong>Grade:</strong> ${randomEnseignant.grade || 'N/A'}</p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  removeEnseignantFromModule(affectationId: number) {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Cette action retirera l\'enseignant affecté à ce module.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, retirer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove enseignant assignment via shared service
        this.sharedAffectationService.removeEnseignantFromModule(affectationId);
        Swal.fire('🗑️ Retiré', 'Enseignant retiré avec succès.', 'info');
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

  // Statistics methods
  getEnseignantsAssignedCount(): number {
    return this.affectations.filter(a => a.enseignantAffecte).length;
  }

  getUnassignedEnseignantsCount(): number {
    return this.affectations.filter(a => !a.enseignantAffecte).length;
  }

  getEnseignantAssignmentRate(): number {
    if (this.affectations.length === 0) return 0;
    return Math.round((this.getEnseignantsAssignedCount() / this.affectations.length) * 100);
  }
}