import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmploiDuTempsService } from '../../../Service/emploi-du-temps.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-calendrier-surveillance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-calendrier-surveillance.component.html',
  styleUrl: './add-calendrier-surveillance.component.scss'
})
export class AddCalendrierSurveillanceComponent {
  emploiForm!: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private emploiService: EmploiDuTempsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const enseignantIdFromRoute = this.route.snapshot.paramMap.get('id');

    this.emploiForm = this.fb.group({
      enseignantId: [enseignantIdFromRoute ?? '', Validators.required],
      date: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required],
      salleId: ['', Validators.required],
      semestre: ['', [Validators.required, Validators.pattern("^[1-2]$")]]
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.emploiForm.invalid) {
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      return;
    }

    const formData = {
      ...this.emploiForm.value,
      enseignant: { id: this.emploiForm.value.enseignantId }
    };

    this.emploiService.planifier(formData).subscribe({
      next: () => {
        this.successMessage = 'Surveillance ajoutée avec succès.';
        this.emploiForm.reset();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error || 'Une erreur inconnue est survenue.';
      }
    });
  }
}
