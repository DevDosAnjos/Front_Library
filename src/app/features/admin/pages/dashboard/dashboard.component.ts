import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { SimpleAuthService } from '../../../../core/services/simple-auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard-management.component.css'
})
export class AdminDashboardComponent implements OnInit {
  adminUser: any = null;
  
  // Estatísticas básicas das entidades - renomeado para compatibilidade com template
  entityStats = {
    totalBooks: 0,
    totalGenres: 0,
    totalUsers: 0,
    totalOrders: 0
  };
  
  isLoading = true;
  currentDate = new Date(); // Propriedade para exibir data atual

  constructor(
    private router: Router,
    private storageService: StorageService,
    private authService: SimpleAuthService
  ) {
    // Dashboard admin inicializado
  }

  ngOnInit() {
    this.checkAdminAuth();
    this.loadDashboardData();
  }

  checkAdminAuth() {
    // Verificar através do AuthService
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      // Não é admin - redirecionar para login
      this.router.navigate(['/auth/login'], {
        queryParams: { message: 'Acesso restrito a administradores.' }
      });
      return;
    }
    
    // Obter dados do usuário atual
    const currentUser = this.authService.getCurrentUserData();
    if (currentUser) {
      this.adminUser = {
        name: currentUser.username,
        role: currentUser.role
      };
    }
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Simular carregamento de estatísticas básicas
    setTimeout(() => {
      this.loadEntityStats();
      this.isLoading = false;
    }, 1000);
  }

  loadEntityStats() {
    // Simular dados estatísticos básicos das entidades
    this.entityStats.totalBooks = 50;
    this.entityStats.totalGenres = 12;
    this.entityStats.totalUsers = 248;
    this.entityStats.totalOrders = 89;
  }

  formatPrice(price: number): string {
    return `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
  }

  // Navegação para diferentes seções de gerenciamento
  navigateToBooks() {
    this.router.navigate(['/admin/books']);
  }

  navigateToGenres() {
    this.router.navigate(['/admin/genres']);
  }

  navigateToUsers() {
    this.router.navigate(['/admin/users']);
  }

  navigateToOrders() {
    this.router.navigate(['/admin/orders']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
