import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { EmploiDuTempsService, EmploiDuTemps } from '../../../Service/emploi-du-temps.service';
import { SalleService, ReservationSalle } from '../../../Service/salle-service.service';
import { EnseignantService } from '../../../Service/enseignant-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-emploi-du-temp',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-emploi-du-temp.component.html',
  styleUrls: ['./add-emploi-du-temp.component.scss']
})
export class AddEmploiDuTempComponent implements OnInit {
  emploiForm!: FormGroup;
  salles: any[] = [];
  groupes: any[] = [];
  enseignants: any[] = [];

  selectedEnseignant: any = null;
  successMessage = '';
  errorMessage = '';

  reservationsSalle: ReservationSalle[] = [];

  typeActivites: string[] = ['Examen', 'Cours', 'TD', 'TP', 'Soutenance', 'Surveillance'];

  constructor(
    private fb: FormBuilder,
    private emploiService: EmploiDuTempsService,
    private salleService: SalleService,
    private enseignantService: EnseignantService,
  ) { }

  ngOnInit(): void {
    this.emploiForm = this.fb.group({
      enseignantId: ['', Validators.required],
      date: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required],
      typeActivite: ['', Validators.required],
      salle: ['', Validators.required],  // nom de la salle
      groupeId: ['', Validators.required]
    });

    this.loadData();

    // Recharge les réservations quand date ou salle change
    this.emploiForm.get('date')?.valueChanges.subscribe(() => this.loadReservations());
    this.emploiForm.get('salle')?.valueChanges.subscribe(() => this.loadReservations());
  }

  loadData() {
    this.salleService.getAllSalles().subscribe(data => this.salles = data);
    this.enseignantService.getAllEnseignants().subscribe(data => this.enseignants = data);
    this.emploiService.getAllGroupes().subscribe(data => this.groupes = data);
  }

  onEnseignantSelected(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const id = selectElement.value;
    this.selectedEnseignant = this.enseignants.find(e => e.id == id) || null;
    this.emploiForm.patchValue({ enseignantId: id });
  }

  loadReservations(): void {
    const salleNom = this.emploiForm.get('salle')?.value;
    const date = this.emploiForm.get('date')?.value;

    if (salleNom && date) {
      const salle = this.salles.find(s => s.nom === salleNom);
      if (salle) {
        this.salleService.getReservationsParSalleEtDate(salle.id, date).subscribe({
          next: (reservations) => {
            this.reservationsSalle = reservations;
          },
          error: (err) => {
            console.error('Erreur chargement réservations', err);
            this.reservationsSalle = [];
          }
        });
      } else {
        this.reservationsSalle = [];
      }
    } else {
      this.reservationsSalle = [];
    }
  }

  getEnseignantName(id?: number): string {
    if (!id) return 'Inconnu';
    const enseignant = this.enseignants.find(e => e.id === id);
    return enseignant ? enseignant.nom + ' ' + enseignant.prenom : 'Inconnu';
  }

  onSubmit(): void {
    if (this.emploiForm.invalid || !this.selectedEnseignant) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement et sélectionner un enseignant.';
      this.successMessage = '';
      return;
    }

    const formValue = this.emploiForm.value;

    const newEmploi: EmploiDuTemps = {
      id: null,
      enseignantId: formValue.enseignantId,
      date: formValue.date,
      heureDebut: formValue.heureDebut,
      heureFin: formValue.heureFin,
      typeActivite: formValue.typeActivite,
      salle: formValue.salle,
      groupeId: formValue.groupeId
    };

    this.emploiService.create(newEmploi).subscribe({
      next: () => {
        this.successMessage = 'Emploi du temps ajouté avec succès.';
        this.errorMessage = '';
        this.emploiForm.reset();
        this.selectedEnseignant = null;
        this.reservationsSalle = [];
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l\'ajout de l\'emploi du temps.';
        this.successMessage = '';
      }
    });
  }
}
