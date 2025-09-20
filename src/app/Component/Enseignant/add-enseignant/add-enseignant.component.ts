import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { Enseignant } from '../../../Entity/Enseignant';
import { EnseignantService } from '../../../Service/enseignant-service.service';
import { UserServiceService } from '../../../Service/user-service.service';
import { MyModule } from '../../../Entity/module.model';
import { CommonModule } from '@angular/common';
import { UnitePedagogique } from '../../../Entity/unite-pedagogique.model';
import { User } from '../../../Entity/User';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-enseignant',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-enseignant.component.html',
  styleUrls: ['./add-enseignant.component.scss'],
})
export class AddEnseignantComponent implements OnInit {
  enseignantForm!: FormGroup;

  users: User[] = [];
  modules: MyModule[] = [];
  unitePedagogiques: UnitePedagogique[] = [];

  constructor(
    private fb: FormBuilder,
    private enseignantService: EnseignantService,
    private userService: UserServiceService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadModules();
    this.loadUnitePedagogiques();
    this.loadEnseignantUsers();

    this.enseignantForm = this.fb.group({
      userId: ['', Validators.required],
      matricule: ['', Validators.required],
      nom: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      moduleId: ['', Validators.required],
      unitePedagogiqueId: ['', Validators.required], // Stocke l'id de l'unité sélectionnée
      grade: ['', Validators.required],
    });

    // Quand unité pédagogique change, on réinitialise le module
    this.enseignantForm.get('unitePedagogiqueId')?.valueChanges.subscribe((val) => {
      console.log('Unité sélectionnée :', val);
      console.log('Modules filtrés:', this.filteredModules);
      // Reset moduleId quand unité change
      this.enseignantForm.patchValue({ moduleId: null });
    });
  }

  loadEnseignantUsers(): void {
    this.userService.getAllUsers().subscribe((users) => {
      this.users = users.filter((user) => user.role === 'ENSEIGNANT');
      console.log('Users chargés :', this.users);
    });
  }

  loadModules(): void {
    this.enseignantService.getAllModules().subscribe((modules) => {
      this.modules = modules;
      console.log('Modules chargés :', this.modules);
    });
  }

  loadUnitePedagogiques(): void {
    this.enseignantService.getAllUnites().subscribe((unites) => {
      this.unitePedagogiques = unites;
      console.log('Unités pédagogiques chargées :', this.unitePedagogiques);
    });
  }

  onUserSelected(userId: any): void {
    const id = +userId;
    const selectedUser = this.users.find((user) => user.id === id);

    if (selectedUser) {
      this.enseignantForm.patchValue({
        matricule: selectedUser.matricule,
        nom: selectedUser.username,
        email: selectedUser.email,
      });

      this.enseignantForm.get('matricule')?.disable();
      this.enseignantForm.get('nom')?.disable();
      this.enseignantForm.get('email')?.disable();
    } else {
      this.enseignantForm.get('matricule')?.reset();
      this.enseignantForm.get('nom')?.reset();
      this.enseignantForm.get('email')?.reset();

      this.enseignantForm.get('matricule')?.enable();
      this.enseignantForm.get('nom')?.enable();
      this.enseignantForm.get('email')?.enable();
    }
  }

  get filteredModules(): MyModule[] {
    const selectedUniteId = +this.enseignantForm.get('unitePedagogiqueId')?.value;
    if (!selectedUniteId) return this.modules;
    return this.modules.filter((mod) => mod.unitePedagogique?.id === selectedUniteId);
  }

  onSubmit(): void {
    if (this.enseignantForm.valid) {
      const formValue = this.enseignantForm.getRawValue();

      const enseignant: Enseignant = {
        userId: formValue.userId,
        matricule: formValue.matricule,
        nom: formValue.nom,
        telephone: formValue.telephone,
        email: formValue.email,
        moduleId: formValue.moduleId,
        unitePedagogique: {
    id: formValue.unitePedagogiqueId,
  },
        grade: formValue.grade,
      };

      this.enseignantService.addEnseignant(enseignant).subscribe({
        next: () => {
          Swal.fire('Succès', "L'enseignant a été ajouté avec succès", 'success');
          this.router.navigate(['/enseignants']);
        },
        error: (err) => {
          Swal.fire('Erreur', "Erreur lors de l'ajout de l'enseignant", 'error');
          console.error(err);
        },
      });
    }
  }
}
