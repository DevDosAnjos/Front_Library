import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Verifica se existe token no localStorage (implementação básica)
    const token = localStorage.getItem('authToken');
    
    if (token) {
      return true;
    }

    // Redireciona para login
    this.router.navigate(['/login']);
    return false;
  }
}
