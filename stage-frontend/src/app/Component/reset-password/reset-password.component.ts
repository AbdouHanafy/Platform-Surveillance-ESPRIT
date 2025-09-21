import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserServiceService } from '../../Service/user-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',

  imports: [ CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: UserServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Token de réinitialisation manquant.',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  onResetPassword(): void {
    if (!this.newPassword || this.newPassword.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Le mot de passe doit contenir au moins 6 caractères.',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    if (!this.token) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Token invalide ou manquant.',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Mot de passe réinitialisé avec succès. Vous allez être redirigé.',
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true,
          willClose: () => {
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.error?.message || 'Erreur lors de la réinitialisation du mot de passe.',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
}
