import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StorageService } from '../../core/services/storage.service';
import { CartService } from '../../core/services/cart.service';

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
  
  private cartSubscription?: Subscription;

  constructor(
    private storageService: StorageService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Verificar se usuário está logado
    this.checkAuthStatus();
    
    // Inicializar contagem do carrinho
    this.initializeCartCount();
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  checkAuthStatus() {
    const token = this.storageService.getItem('authToken');
    this.isLoggedIn = !!token;
    if (this.isLoggedIn) {
      this.userName = this.storageService.getItem('userName') || 'Usuário';
    }
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
    this.storageService.removeItem('authToken');
    this.storageService.removeItem('userName');
    this.storageService.removeItem('userRole');
    this.isLoggedIn = false;
    this.userName = '';
    this.router.navigate(['/']);
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
      queryParams: { gender_id: genreId } 
    });
  }
}
