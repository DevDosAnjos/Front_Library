import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log('AdminGuard: canActivate chamado para rota:', state.url);
    console.log('AdminGuard: isAuthenticated?', this.authService.isAuthenticated());
    console.log('AdminGuard: isAdmin?', this.authService.isAdmin());
    
    // Verifica se usuário está logado e é admin
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      console.log('AdminGuard: Acesso autorizado');
      return true;
    }

    console.log('AdminGuard: Acesso negado, redirecionando para login');
    // Redireciona para login se não estiver autenticado ou não for admin
    this.router.navigate(['/auth/login'], {
      queryParams: { message: 'Acesso restrito a administradores.' }
    });
    return false;
  }
}
