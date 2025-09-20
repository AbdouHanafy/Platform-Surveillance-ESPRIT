import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserServiceService } from '../../../../Service/user-service.service';
import { User } from '../../../../Entity/User';


@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.scss']
})
export class UpdateUserComponent implements OnInit {
  updateUserForm!: FormGroup;
  userId!: number;
  userData!: User;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    this.updateUserForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      matricule: ['', Validators.required],
      role: ['', Validators.required]
    });

    this.loadUserData();
  }

  loadUserData(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const foundUser = users.find(u => u.id === this.userId);
        if (foundUser) {
          this.userData = foundUser;
          this.updateUserForm.patchValue({
            username: foundUser.username,
            email: foundUser.email,
            matricule: foundUser.matricule,
            role: foundUser.role
          });
        } else {
          alert('Utilisateur introuvable.');
          this.navigateToUsers();
        }
      },
      error: (err) => {
        console.error('Erreur de chargement:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.updateUserForm.invalid) return;

    const updatedUser: User = {
      ...this.userData,
      ...this.updateUserForm.value,
      password: this.userData.password // conserver l'ancien mot de passe
    };

    this.userService.updateUser(this.userId, updatedUser).subscribe({
      next: () => {
        alert('Utilisateur mis à jour avec succès.');
        this.navigateToUsers();
      },
      error: (err) => {
        console.error('Erreur mise à jour:', err);
        alert('Erreur lors de la mise à jour.');
      }
    });
  }

  navigateToUsers(): void {
    this.router.navigate(['/users']); // Assure-toi que cette route existe pour la liste utilisateurs
  }
}


