import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserServiceService } from '../../Service/user-service.service';
import { User } from '../../Entity/User';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = false;
  role: string = '';
  currentUserId: number = 0;

  constructor(private userService: UserServiceService, private router: Router) {
    // Récupérer role et id de l'utilisateur connecté depuis localStorage
    this.role = localStorage.getItem('role') || '';
    this.currentUserId = Number(localStorage.getItem('id')) || 0;
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        // Filtrage selon rôle
        if (this.role === 'ENSEIGNANT') {
          this.users = data.filter(u => u.id === this.currentUserId);
        } else {
          this.users = data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs', err);
        this.isLoading = false;
        Swal.fire({
          title: 'Erreur',
          text: 'Impossible de charger les utilisateurs',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  toggleUserActive(user: User): void {
    if (this.role !== 'SUPER_ADMIN') return; // seule super admin peut activer/désactiver

    const newStatus = !user.active;
    const actionText = newStatus ? 'activer' : 'désactiver';
    
    Swal.fire({
      title: 'Confirmer l\'action',
      text: `Êtes-vous sûr de vouloir ${actionText} cet utilisateur ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus ? '#10b981' : '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Oui, ${actionText}`,
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.setUserActiveStatus(user.id, newStatus).subscribe({
          next: (response) => {
            user.active = newStatus;
            Swal.fire({
              title: 'Succès',
              text: response.message,
              icon: 'success',
              confirmButtonColor: '#10b981',
              timer: 2000,
              timerProgressBar: true
            });
          },
          error: () => {
            Swal.fire({
              title: 'Erreur',
              text: 'Impossible de changer le statut',
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });
          }
        });
      }
    });
  }

  onDeleteUser(id: number): void {
    if (this.role !== 'SUPER_ADMIN') return; // seule super admin peut supprimer

    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(id).subscribe({
          next: (message) => {
            Swal.fire({
              title: 'Supprimé !',
              text: message,
              icon: 'success',
              confirmButtonColor: '#10b981',
              timer: 2000,
              timerProgressBar: true
            });
            this.loadUsers();
          },
          error: (err) => {
            Swal.fire({
              title: 'Erreur',
              text: err.error?.message || 'Échec de la suppression',
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });
          }
        });
      }
    });
  }

  updateUser(user: User): void {
    if (this.role !== 'SUPER_ADMIN') return; // seule super admin peut modifier
    this.router.navigate(['/update-user', user.id]);
  }

  navigateToRegister(): void {
    if (this.role !== 'SUPER_ADMIN' && this.role !== 'ADMIN') return; // seule super admin et admin peut ajouter
    this.router.navigate(['/register']);
  }

  // Helper method to get user initials for avatar
  getInitials(username: string): string {
    if (!username) return '?';
    
    const names = username.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  // TrackBy function for better performance with *ngFor
  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  refreshUsers(): void {
    this.loadUsers();
  }

  getActiveUsersCount(): number {
    return this.users.filter(user => user.active).length;
  }

  getInactiveUsersCount(): number {
    return this.users.filter(user => !user.active).length;
  }

  getRoleClass(role: string): string {
    if (!role) return '';
    return role.toLowerCase();
  }

  formatEmail(email: string): string {
    if (!email) return '';
    return email.toLowerCase();
  }

  sortUsers(column: string): void {
    console.log(`Sorting by ${column}`);
  }
}
