import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StorageService } from '../../core/services/storage.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  cartItemsCount = 0;
  isLoggedIn = false;
  userName = '';
  currentUser: User | null = null;
  
  private cartSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private storageService: StorageService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscrever mudanças de autenticação
    this.subscribeToAuthChanges();
    
    // Inicializar contagem do carrinho
    this.initializeCartCount();
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private subscribeToAuthChanges() {
    this.authSubscription = this.authService.currentUser$.subscribe({
      next: (user: any) => {
        const wasLoggedIn = this.isLoggedIn;
        const oldUserName = this.userName;
        
        this.currentUser = user;
        this.isLoggedIn = !!user;
        this.userName = user?.username || '';
        
        // Só loga se realmente houve mudança
        if (wasLoggedIn !== this.isLoggedIn || oldUserName !== this.userName) {
          console.log('Header: Estado de autenticação atualizado', { 
            isLoggedIn: this.isLoggedIn, 
            userName: this.userName, 
            isAdmin: this.isAdmin() 
          });
        }
        
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Erro ao subscrever mudanças de autenticação:', error);
      }
    });
  }

  checkAuthStatus() {
    // Este método não é mais necessário, pois agora reagimos automaticamente às mudanças
    // Mantendo por compatibilidade, mas delegando para o AuthService
    this.currentUser = this.authService.getCurrentUserData();
    this.isLoggedIn = this.authService.isAuthenticated();
    this.userName = this.currentUser?.username || '';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  initializeCartCount() {
    try {
      // Tentar usar o CartService primeiro
      if (this.cartService && this.cartService.cart$) {
        this.cartSubscription = this.cartService.cart$.subscribe({
          next: (cart) => {
            this.cartItemsCount = cart?.totalItems || 0;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.warn('Erro ao subscrever ao carrinho:', error);
            this.updateCartCountFromStorage();
          }
        });
      } else {
        // Fallback: carregar do storage diretamente
        this.updateCartCountFromStorage();
      }
    } catch (error) {
      console.warn('Erro ao inicializar carrinho:', error);
      this.updateCartCountFromStorage();
    }
  }

  updateCartCountFromStorage() {
    try {
      const cartData = this.storageService.getObject<any>('shopping_cart');
      this.cartItemsCount = cartData ? (cartData.totalItems || 0) : 0;
      this.cdr.detectChanges();
    } catch (error) {
      console.warn('Erro ao carregar carrinho do storage:', error);
      this.cartItemsCount = 0;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goToCart() {
    console.log('goToCart() chamado - redirecionando para /cart');
    // Permite acesso ao carrinho para todos os usuários
    this.router.navigate(['/cart']);
  }

  goToProfile() {
    if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  logout() {
    console.log('Header: Executando logout');
    this.authService.logout();
    // Solução temporária: recarregar página para garantir limpeza completa do estado
    window.location.href = '/';
  }

  onAdminLinkClick(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    console.log('Header: Link Admin clicado');
    console.log('Header: isAuthenticated?', this.authService.isAuthenticated());
    console.log('Header: isAdmin?', this.authService.isAdmin());
    console.log('Header: Tentando navegar para /admin');
    
    // Navegar programaticamente para garantir que funcione
    this.router.navigate(['/admin']).then(
      (success) => console.log('Header: Navegação bem-sucedida:', success),
      (error) => console.error('Header: Erro na navegação:', error)
    );
  }

  testAdminNavigation() {
    console.log('=== TESTE DE NAVEGAÇÃO ADMIN ===');
    console.log('Estado de autenticação:', {
      isAuthenticated: this.authService.isAuthenticated(),
      isAdmin: this.authService.isAdmin(),
      currentUser: this.authService.getCurrentUserData()
    });
    
    console.log('Tentando navegar para /admin...');
    this.router.navigate(['/admin']).then(
      (success) => {
        console.log('Navegação para /admin bem-sucedida:', success);
        console.log('URL atual:', this.router.url);
      },
      (error) => {
        console.error('Erro na navegação para /admin:', error);
      }
    );
  }

  // Método de debug temporário
  debugAuthState() {
    console.log('=== DEBUG AUTH STATE ===');
    console.log('Header component state:', {
      isLoggedIn: this.isLoggedIn,
      userName: this.userName,
      currentUser: this.currentUser,
      isAdmin: this.isAdmin()
    });
    console.log('AuthService state:', {
      isAuthenticated: this.authService.isAuthenticated(),
      isAdmin: this.authService.isAdmin(),
      currentUserData: this.authService.getCurrentUserData(),
      currentUser: this.authService.getCurrentUser()
    });
    console.log('Storage data:', {
      authToken: this.storageService.getItem('authToken'),
      userName: this.storageService.getItem('userName'),
      userRole: this.storageService.getItem('userRole'),
      currentUser: this.storageService.getObject('currentUser')
    });
    console.log('=========================');
  }

  // Método para limpar storage (debug)
  clearAuthData() {
    console.log('=== LIMPANDO DADOS DE AUTH ===');
    this.storageService.removeItem('authToken');
    this.storageService.removeItem('userName');
    this.storageService.removeItem('userRole');
    this.storageService.removeItem('currentUser');
    this.authService.logout();
    console.log('Dados limpos! Recarregue a página.');
  }

  // Gêneros populares para o dropdown - baseados nos dados reais
  popularGenres = [
    { name: 'Ficção Científica', slug: 'ficcao-cientifica', id: 1 },
    { name: 'Fantasia', slug: 'fantasia', id: 2 },
    { name: 'Suspense e Mistério', slug: 'suspense-misterio', id: 3 },
    { name: 'Romance', slug: 'romance', id: 4 },
    { name: 'Literatura Clássica', slug: 'literatura-classica', id: 5 },
    { name: 'Autoajuda', slug: 'autoajuda', id: 10 },
    { name: 'Infantojuvenil', slug: 'infantojuvenil', id: 11 },
    { name: 'Tecnologia e Ciência', slug: 'tecnologia-ciencia', id: 8 }
  ];

  goToGenre(genreId: number) {
    this.router.navigate(['/books'], { 
      queryParams: { genderID: genreId } 
    });
  }
}
