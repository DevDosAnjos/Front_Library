import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BookService } from '../../../../core/services/book.service';
import { GenderService } from '../../../../core/services/gender.service';
import { UserService } from '../../../../core/services/user.service';
import { OrderService } from '../../../../core/services/order.service';
import { forkJoin, catchError, of } from 'rxjs';

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
    private authService: AuthService,
    private bookService: BookService,
    private genderService: GenderService,
    private userService: UserService,
    private orderService: OrderService
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
    console.log('🔄 Carregando dados do dashboard...');
    
    // Carregar dados reais da API em paralelo com melhor tratamento de erro
    forkJoin({
      books: this.bookService.getBooks().pipe(
        catchError((error) => {
          console.error('❌ Erro ao carregar livros:', error);
          return of([]);
        })
      ),
      genders: this.genderService.getAllGenders().pipe(
        catchError((error) => {
          console.error('❌ Erro ao carregar gêneros:', error);
          return of([]);
        })
      ),
      users: this.userService.getAllUsers().pipe(
        catchError((error) => {
          console.error('❌ Erro ao carregar usuários:', error);
          return of([]);
        })
      ),
      orders: this.orderService.getAllOrders().pipe(
        catchError((error) => {
          console.error('❌ Erro ao carregar pedidos:', error);
          return of([]);
        })
      )
    }).subscribe({
      next: (data) => {
        console.log('✅ Dados do dashboard carregados:', {
          books: data.books.length,
          genders: data.genders.length,
          users: data.users.length,
          orders: data.orders.length
        });
        
        this.entityStats.totalBooks = data.books.length;
        this.entityStats.totalGenres = data.genders.length;
        this.entityStats.totalUsers = data.users.length;
        this.entityStats.totalOrders = data.orders.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erro crítico ao carregar dados do dashboard:', error);
        // Em caso de erro crítico, carregar dados como zero mas manter funcionalidade
        this.entityStats.totalBooks = 0;
        this.entityStats.totalGenres = 0;
        this.entityStats.totalUsers = 0;
        this.entityStats.totalOrders = 0;
        this.isLoading = false;
      }
    });
  }

  loadEntityStats() {
    // Dados de fallback em caso de erro na API
    this.entityStats.totalBooks = 0;
    this.entityStats.totalGenres = 0;
    this.entityStats.totalUsers = 0;
    this.entityStats.totalOrders = 0;
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
