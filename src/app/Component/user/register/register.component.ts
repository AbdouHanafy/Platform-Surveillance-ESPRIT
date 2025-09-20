import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { User } from '../../../Entity/User';
import { UserServiceService } from '../../../Service/user-service.service';
import { Enseignant } from '../../../Entity/Enseignant';
import { UnitePedagogique } from '../../../Entity/unite-pedagogique.model';
import { EnseignantService } from '../../../Service/enseignant-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  isAddingTeacher = false;
  isSubmittingUser = false;
  isSubmittingTeacher = false;
  successMessage = '';
  errorMessage = '';

  userForm!: FormGroup;
  enseignantForm!: FormGroup;

  unitePedagogiques: UnitePedagogique[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserServiceService,
    private enseignantService: EnseignantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUnitePedagogiques();
  }

  initForms() {
    // Formulaire utilisateur simple (pour ajouter un user seul)
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ADMIN', Validators.required], // Par défaut ADMIN
      matricule: ['', [Validators.required, Validators.minLength(3)]],
    });

    // Formulaire enseignant + user (nouveau endpoint crée user + enseignant)
    this.enseignantForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      matricule: ['', [Validators.required, Validators.minLength(3)]],
      telephone: ['', Validators.required],
      grade: ['', Validators.required],
      unitePedagogiqueId: ['', Validators.required],
      // moduleId supprimé ici
    });

    // Reset inutile pour moduleId supprimé
  }

  loadUnitePedagogiques() {
    this.enseignantService.getAllUnites().subscribe((ups) => {
      this.unitePedagogiques = ups;
    });
  }

  onToggleForm(value: 'user' | 'teacher') {
    this.isAddingTeacher = (value === 'teacher');
    this.clearMessages();

    if (value === 'user') {
      this.userForm.reset({ role: 'ADMIN' });
    } else {
      this.enseignantForm.reset();
    }
  }

  onSubmitUser() {
    if (this.userForm.invalid) {
      this.showError('Veuillez remplir correctement tous les champs.');
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.isSubmittingUser = true;
    this.clearMessages();

    const user: User = this.userForm.value;

    this.userService.register(user).subscribe({
      next: () => {
        this.isSubmittingUser = false;
        this.showSuccess("L'utilisateur a été ajouté avec succès.");

        setTimeout(() => {
          this.router.navigate(['/users']);
        }, 2000);

        Swal.fire('Succès', "L'utilisateur a été ajouté avec succès.", 'success');
      },
      error: () => {
        this.isSubmittingUser = false;
        this.showError("Erreur lors de l'ajout de l'utilisateur.");
        Swal.fire('Erreur', "Erreur lors de l'ajout de l'utilisateur.", 'error');
      },
    });
  }

  onSubmitEnseignant() {
    if (this.enseignantForm.invalid) {
      this.showError('Veuillez remplir correctement tous les champs enseignants.');
      this.markFormGroupTouched(this.enseignantForm);
      return;
    }

    this.isSubmittingTeacher = true;
    this.clearMessages();

    const formData = this.enseignantForm.value;

    const user = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      matricule: formData.matricule,
      role: 'ENSEIGNANT'
    };

const enseignant: Partial<Enseignant> = {
  telephone: formData.telephone,
  grade: formData.grade,
  unitePedagogique: {
    id: +formData.unitePedagogiqueId  // Important : envoyer l'id ici
  },
  nom: formData.username,
  email: formData.email,
  matricule: formData.matricule,
};

    this.enseignantService.registerUserAndEnseignant(user, enseignant).subscribe({
      next: () => {
        this.isSubmittingTeacher = false;
        this.showSuccess("L'enseignant a été ajouté avec succès.");

        setTimeout(() => {
          this.router.navigate(['/enseignants']);
        }, 2000);

        Swal.fire('Succès', "L'enseignant a été ajouté avec succès.", 'success');
      },
      error: () => {
        this.isSubmittingTeacher = false;
        this.showError("Erreur lors de l'ajout de l'enseignant.");
        Swal.fire('Erreur', "Erreur lors de l'ajout de l'enseignant.", 'error');
      },
    });
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';

    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';

    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // méthode getFilteredModules() supprimée

}
