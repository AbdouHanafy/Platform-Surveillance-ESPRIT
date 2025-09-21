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
  selector: 'app-affectation-salle-auto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './affectation-salle-auto.component.html',
  styleUrls: ['./affectation-salle-auto.component.scss']
})
export class AffectationSalleAutoComponent implements OnInit {
  affectations: ModuleAffectationData[] = [];
  salles: any[] = [];
  isAssigning = false;

  constructor(
    private affectationService: AffectationService,
    private emploiDuTempsService: EmploiDuTempsService,
    private enseignantService: EnseignantService,
    private salleService: SalleService,
    private sharedAffectationService: SharedAffectationService
  ) {}

  ngOnInit(): void {
    this.loadSalles();
    this.subscribeToSharedData();
  }

  // Subscribe to shared data for synchronization
  subscribeToSharedData() {
    this.sharedAffectationService.moduleAffectations$.subscribe(data => {
      this.affectations = data;
      console.log('Affectations updated from shared service:', data);
    });
  }

  loadSalles() {
    this.salleService.getAllSalles().subscribe(data => {
      this.salles = data;
      console.log("Salles chargées:", this.salles);
    });
  }

  // One-click assign ALL salles randomly
  assignAllSallesRandomly() {
    if (this.salles.length === 0) {
      Swal.fire('❌ Erreur', 'Aucune salle disponible dans le système.', 'error');
      return;
    }

    const unassignedCount = this.affectations.filter(a => !a.salleAffectee).length;
    if (unassignedCount === 0) {
      Swal.fire('ℹ️ Information', 'Toutes les salles sont déjà affectées.', 'info');
      return;
    }

    Swal.fire({
      title: '🏢 Affecter TOUTES les Salles',
      text: `Voulez-vous affecter aléatoirement des salles à ${unassignedCount} module(s) non assigné(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, affecter tout',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.performBulkSalleAssignment();
      }
    });
  }

  performBulkSalleAssignment() {
    this.isAssigning = true;

    this.sharedAffectationService.assignAllSallesRandomly().subscribe({
      next: (result) => {
        this.isAssigning = false;
        Swal.fire({
          title: '✅ Affectation Terminée',
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

  // Individual assignment for single module
  assignSalleToModule(affectation: ModuleAffectationData) {
    // Find suitable salles for this group
    const requiredCapacity = Math.ceil(affectation.groupe.effectif * 1.1);
    const suitableSalles = this.salles.filter(salle => 
      salle.capacite >= requiredCapacity
    );

    if (suitableSalles.length === 0) {
      Swal.fire('❌ Aucune salle disponible', 
        `Aucune salle avec une capacité suffisante (${requiredCapacity} places) n'est disponible.`, 
        'error');
      return;
    }

    // Choose optimal salle (closest capacity match)
    suitableSalles.sort((a, b) => {
      const diffA = Math.abs(a.capacite - affectation.groupe.effectif);
      const diffB = Math.abs(b.capacite - affectation.groupe.effectif);
      return diffA - diffB;
    });

    const optimalSalle = suitableSalles[0];

    // Update via shared service
    this.sharedAffectationService.assignSalleToModule(
      affectation.id, 
      optimalSalle.id, 
      optimalSalle.nomSalle, 
      optimalSalle.capacite
    );

    Swal.fire({
      title: '✅ Salle Affectée',
      html: `
        <div style="text-align: left;">
          <p><strong>Module:</strong> ${affectation.module.libelleModule}</p>
          <p><strong>Groupe:</strong> ${this.getDisplayClassName(affectation.groupe)}</p>
          <p><strong>Salle assignée:</strong> ${optimalSalle.nomSalle}</p>
          <p><strong>Capacité:</strong> ${optimalSalle.capacite} places</p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  removeSalleFromModule(affectationId: number) {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Cette action retirera la salle affectée à ce module.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, retirer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove salle assignment via shared service
        this.sharedAffectationService.removeSalleFromModule(affectationId);
        Swal.fire('🗑️ Retiré', 'Salle retirée avec succès.', 'info');
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
  getSallesAssignedCount(): number {
    return this.affectations.filter(a => a.salleAffectee).length;
  }

  getUnassignedSallesCount(): number {
    return this.affectations.filter(a => !a.salleAffectee).length;
  }

  getSalleAssignmentRate(): number {
    if (this.affectations.length === 0) return 0;
    return Math.round((this.getSallesAssignedCount() / this.affectations.length) * 100);
  }
}