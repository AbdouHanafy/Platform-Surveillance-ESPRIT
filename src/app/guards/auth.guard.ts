import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const expectedRoles = route.data['roles'] as string[] || [];
    const userRole = localStorage.getItem('role') || '';

    if (expectedRoles.includes(userRole)) {
      // Accès autorisé
      return true;
    } else {
      // Accès refusé : bloquer la navigation sans redirection
      Swal.fire({
        icon: 'error',
        title: 'Accès refusé',
        text: 'Vous n\'avez pas la permission d\'accéder à cette page.',
        confirmButtonColor: 'var(--brand-red)'
      });

      // Retourne false pour bloquer la navigation
      return false;
    }
  }
}
