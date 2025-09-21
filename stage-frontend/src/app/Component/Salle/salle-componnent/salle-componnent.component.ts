import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SalleService, ReservationSalle } from '../../../Service/salle-service.service';
import { EnseignantService } from '../../../Service/enseignant-service.service';
import { CommonModule, NgFor } from '@angular/common';
import { EmploiDuTemps, EmploiDuTempsService } from '../../../Service/emploi-du-temps.service';

@Component({
  selector: 'app-salle-componnent',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgFor],
  templateUrl: './salle-componnent.component.html',
  styleUrls: ['./salle-componnent.component.scss']
})
export class SalleComponnentComponent implements OnInit{




   salles: any[] = [];
  blocsEsprit: string[] = ['A', 'B', 'C', 'D', 'E', 'G', 'I', 'J', 'K', 'M'];

  // Modal Ajout Salle
  isModalOpen = false;
  salleForm!: FormGroup;

  // Modal Réservation
  isReservationModalOpen = false;
  reservationForm!: FormGroup;
  selectedSalle: any = null;
  reservationErrorMessage: string | null = null;
  isSubmittingReservation = false;

  enseignants: any[] = [];

  // Modal Disponibilités
  isDisponibilitesModalOpen = false;
disponibilites: EmploiDuTemps[] = [];
  disponibilitesError: string | null = null;

  constructor(
    private salleService: SalleService,
    private enseignantService: EnseignantService,
    private emploiService: EmploiDuTempsService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadEnseignants();
    this.loadSalles();
    this.initForms();
  }

  private loadEnseignants(): void {
    this.enseignantService.getAllEnseignants().subscribe({
      next: (data) => (this.enseignants = data),
      error: (err) => console.error('Erreur chargement enseignants', err),
    });
  }

  private loadSalles(): void {
    this.salleService.getSallesWithStatus().subscribe({
      next: (data) => (this.salles = data),
      error: (err) => console.error('Erreur chargement salles avec status', err),
    });
  }

  private initForms(): void {
    this.salleForm = this.fb.group({
      nom: ['01', Validators.required],
      capacite: [1, [Validators.required, Validators.min(1)]],
      bloc: ['', Validators.required],
      etage: [1, [Validators.required, Validators.min(1)]],
    });

    this.reservationForm = this.fb.group({
      dateExamen: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required],
      matricule: ['', Validators.required],
    });

    // Reset erreur réservation quand formulaire change
    this.reservationForm.valueChanges.subscribe(() => {
      this.reservationErrorMessage = null;
    });
  }

  // ==== Modal Ajout Salle ====
  openModal(): void {
    this.isModalOpen = true;
  }
  closeModal(): void {
    this.isModalOpen = false;
    this.salleForm.reset({ nom: '01', capacite: 1, bloc: '', etage: 1 });
  }
  onSubmit(): void {
    if (this.salleForm.invalid) return;
    this.salleService.createSalle(this.salleForm.value).subscribe({
      next: (res) => {
        this.salles.push(res);
        this.closeModal();
      },
      error: (err) => console.error('Erreur création salle', err),
    });
  }

  // ==== Modal Réservation ====
  openReservationModal(salle: any): void {
    this.selectedSalle = salle;
    this.isReservationModalOpen = true;
    this.reservationForm.reset();
    this.reservationErrorMessage = null;
    this.isSubmittingReservation = false;
  }
  closeReservationModal(): void {
    this.isReservationModalOpen = false;
    this.selectedSalle = null;
    this.reservationForm.reset();
    this.reservationErrorMessage = null;
    this.isSubmittingReservation = false;
  }
  onSubmitReservation(): void {
    if (this.reservationForm.invalid || !this.selectedSalle) return;

    const formValue = this.reservationForm.value;
    const reservation = {
      dateExamen: formValue.dateExamen,
      heureDebut: formValue.heureDebut,
      heureFin: formValue.heureFin,
      salle: { id: this.selectedSalle.id },
      enseignant: { matricule: formValue.matricule },
    };

    this.isSubmittingReservation = true;
    this.salleService.createReservation(reservation, formValue.matricule).subscribe({
      next: () => {
        alert('✅ Réservation réussie !');
        this.closeReservationModal();
        this.loadSalles();
      },
      error: (err) => {
        console.error('Erreur réservation complète:', err);
        switch (err.status) {
          case 500:
            this.reservationErrorMessage = '❌ Erreur serveur interne, veuillez réessayer plus tard.';
            break;
          case 404:
            this.reservationErrorMessage = '❌ Enseignant ou salle introuvable.';
            break;
          case 409:
            this.reservationErrorMessage = '❌ Limite de 2 enseignants atteinte pour cette salle à ce créneau.';
            break;
          case 400:
            this.reservationErrorMessage = `❌ ${err.error?.message || 'Requête invalide.'}`;
            break;
          default:
            this.reservationErrorMessage = '❌ Une erreur inconnue est survenue.';
        }
        this.isSubmittingReservation = false;
      },
      complete: () => {
        this.isSubmittingReservation = false;
      }
    });
  }

  // ==== Modal Disponibilités ====
  openDisponibilitesModal(salle: any): void {
  this.selectedSalle = salle;
  this.disponibilitesError = null;
  this.disponibilites = [];

  this.emploiService.getEmploisParSalle(salle.nom).subscribe({
    next: (reservations) => {
      this.disponibilites = reservations;
      this.isDisponibilitesModalOpen = true;
    },
    error: (err) => {
      console.error('Erreur chargement disponibilités', err);
      this.disponibilitesError = 'Impossible de charger les disponibilités.';
      this.isDisponibilitesModalOpen = true;
    },
  });
}
closeDisponibilitesModal(): void {
  this.isDisponibilitesModalOpen = false;
  this.selectedSalle = null;
  this.disponibilites = [];
  this.disponibilitesError = null;
}

selectedFile: File | null = null;

onFileSelected(event: any): void {
  const file: File = event.target.files[0];
  if (file) {
    this.selectedFile = file;
  }
}

uploadFile(): void {
  if (!this.selectedFile) return;

  const formData = new FormData();
  formData.append('file', this.selectedFile);

  this.salleService.importSallesFromExcel(formData).subscribe({
    next: (res) => {
      alert('✅ Importation réussie !');
      this.loadSalles(); // Recharger la liste
      this.selectedFile = null;
    },
    error: (err) => {
      console.error(err);
      alert('❌ Échec importation');
    }
  });
}

}