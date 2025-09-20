import { Component, OnInit } from '@angular/core';
import { Enseignant } from '../../../Entity/Enseignant';
import { EnseignantService } from '../../../Service/enseignant-service.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { UnitePedagogique } from '../../../Entity/unite-pedagogique.model';

@Component({
  selector: 'app-enseignant',
  templateUrl: './enseignant.component.html',
  styleUrls: ['./enseignant.component.scss'],
  imports: [CommonModule],
})
export class EnseignantComponent implements OnInit {
  enseignants: Enseignant[] = [];
  unitePedagogiques: UnitePedagogique[] = [];
  loading: boolean = true;
  role: string = ''; // récupérer depuis le token/session

  constructor(
    private enseignantService: EnseignantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupération du rôle depuis localStorage ou service
    this.role = localStorage.getItem('role') || '';
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    try {
      await Promise.all([
        this.loadUnitePedagogiques(),
        this.loadEnseignants()
      ]);
      // filtrer les enseignants si ENSEIGNANT
      if (this.role === 'ENSEIGNANT') {
        const currentMatricule = localStorage.getItem('matricule') || '';
        this.enseignants = this.enseignants.filter(e => e.matricule === currentMatricule);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      this.loading = false;
    }
  }

  loadUnitePedagogiques(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.enseignantService.getAllUnites().subscribe({
        next: (data) => {
          this.unitePedagogiques = data;
          resolve();
        },
        error: (err) => {
          console.error('Erreur chargement unités pédagogiques:', err);
          reject(err);
        }
      });
    });
  }

  loadEnseignants(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.enseignantService.getAllEnseignants().subscribe({
        next: (data) => {
          this.enseignants = data;
          resolve();
        },
        error: (err) => {
          console.error('Erreur chargement enseignants:', err);
          reject(err);
        }
      });
    });
  }

  getLibelleUnitePedagogique(id?: number): string {
    if (!id) return 'Unité non assignée';
    const unite = this.unitePedagogiques.find(u => u.id === id);
    return unite?.libelle || 'Unité non assignée';
  }

  getGradeLibelle(grade?: string): string {
    switch (grade) {
      case 'CUP': return 'Chargé d\'UP';
      case 'EFA': return 'Formateur Associé';
      case 'EF': return 'Enseignant Formateur';
      case 'CHEFDEP': return 'Chef de Département';
      default: return 'Non défini';
    }
  }

  getGradeIcon(grade?: string): string {
    switch (grade) {
      case 'CUP': return '👨‍💼';
      case 'EFA': return '👨‍🏫';
      case 'EF': return '🎓';
      case 'CHEFDEP': return '👑';
      default: return '❓';
    }
  }

  navigateToAddEnseignant(): void {
    if (this.role !== 'SUPER_ADMIN') return; // seul SUPER_ADMIN peut ajouter
    this.router.navigate(['/addenseignant']);
  }

  navigateToUpdateEnseignant(id?: number): void {
    if (!id) return;
    if (this.role === 'ENSEIGNANT') return; // enseignant ne peut modifier
    this.router.navigate(['/update-enseignant', id]);
  }

  deleteEnseignant(id?: number): void {
    if (!id) return;
    if (this.role !== 'SUPER_ADMIN') return; // seul SUPER_ADMIN peut supprimer
    
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action ne peut pas être annulée !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.enseignantService.deleteEnseignant(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé !',
              text: 'L\'enseignant a été supprimé avec succès.',
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
            this.loadEnseignants();
          },
          error: (err) => {
            Swal.fire({
              title: 'Erreur !',
              text: err.error?.message || 'Échec de la suppression',
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });
          }
        });
      }
    });
  }

  canEdit(): boolean {
    return this.role === 'SUPER_ADMIN' || this.role === 'ADMIN';
  }

  canDelete(): boolean {
    return this.role === 'SUPER_ADMIN';
  }

  canAdd(): boolean {
    return this.role === 'SUPER_ADMIN';
  }
}
