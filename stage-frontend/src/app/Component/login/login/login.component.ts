import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserServiceService } from '../../../Service/user-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'], 
})
export class LoginComponent {

  matricule = '';
  password = '';
  selectedRole = '';

  isForgotPassword = false;
  resetEmail = '';

  constructor(private authService: UserServiceService, private router: Router) {}

  onLogin(): void {
    if (!this.matricule.trim() || !this.password || !this.selectedRole) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez remplir tous les champs et sélectionner un rôle.',
        confirmButtonColor: '#dc3545',
      });
      return;
    }

    const user = { matricule: this.matricule.trim(), password: this.password };

    this.authService.login(user).subscribe({
      next: (response: any) => {
        console.log('Login response:', response);
        if (response.role !== this.selectedRole) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur rôle',
            text: `Rôle sélectionné: ${this.selectedRole}, mais votre rôle est: ${response.role}`,
            confirmButtonColor: '#dc3545',
          });
          return;
        }
        // Sauvegarde token et infos utilisateur
        localStorage.setItem('token', response.token);
        localStorage.setItem('id', response.id.toString());
        localStorage.setItem('username', response.username);
        localStorage.setItem('role', response.role);
        localStorage.setItem('matricule', response.matricule);
        localStorage.setItem('email', response.email);

        // Redirection selon rôle
        switch (response.role) {
          case 'SUPER_ADMIN':
            this.router.navigate(['/dashboard-superadmin']);
            break;
          case 'ADMIN':
            this.router.navigate(['/dashboard-admin']);
            break;
          case 'ENSEIGNANT':
            this.router.navigate(['/dashboard-enseignant']);
            break;
          default:
            this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.log('Login error:', error);

        let errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';

        // Extraction message d'erreur envoyé par backend (string ou objet)
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        }

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: errorMessage,
          confirmButtonColor: '#dc3545',
        });
      }
    });
  }

  showForgotPassword(): void {
    this.isForgotPassword = true;
    this.clearLoginFields();
  }

  hideForgotPassword(): void {
    this.isForgotPassword = false;
    this.resetEmail = '';
  }

  onForgotPassword(): void {
    if (!this.resetEmail.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez saisir une adresse e-mail valide.',
        confirmButtonColor: '#dc3545',
      });
      return;
    }
    this.authService.forgotPassword(this.resetEmail).subscribe({
      next: () => {
        Swal.fire('Succès', 'Email de réinitialisation envoyé.', 'success');
        this.hideForgotPassword();
      },
      error: () => {
        Swal.fire('Erreur', 'Erreur lors de l\'envoi du mail.', 'error');
      }
    });
  }

  private clearLoginFields(): void {
    this.matricule = '';
    this.password = '';
    this.selectedRole = '';
  }
}
