import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService } from '../../../../core/services/cart.service';
import { StorageService } from '../../../../core/services/storage.service';
import { Cart, CartItem } from '../../../../core/models/api-models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart = { 
    items: [], 
    totalItems: 0, 
    totalPrice: 0,
    updatedAt: new Date()
  };
  isLoading = false;
  isUpdating = false;
  isLoggedIn = false;
  
  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
    this.loadCart();
  }

  checkAuthStatus() {
    const token = this.storageService.getItem('authToken');
    this.isLoggedIn = !!token;
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  loadCart() {
    // Remove o setTimeout desnecessário que pode estar causando problemas
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    
    this.isLoading = true;
    this.cartSubscription = this.cartService.cart$.subscribe({
      next: (cart) => {
        this.cart = cart;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar carrinho:', error);
        this.isLoading = false;
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }

    this.isUpdating = true;
    this.cartService.updateQuantity(item.book.id, newQuantity);
    
    // Simular delay de update
    setTimeout(() => {
      this.isUpdating = false;
    }, 300);
  }

  increaseQuantity(item: CartItem) {
    this.updateQuantity(item, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem) {
    this.updateQuantity(item, item.quantity - 1);
  }

  removeItem(item: CartItem) {
    this.isUpdating = true;
    this.cartService.removeFromCart(item.book.id);
    
    setTimeout(() => {
      this.isUpdating = false;
    }, 300);
  }

  clearCart() {
    if (confirm('Tem certeza que deseja limpar todo o carrinho?')) {
      this.isUpdating = true;
      this.cartService.clearCart();
      
      setTimeout(() => {
        this.isUpdating = false;
      }, 300);
    }
  }

  goToCheckout() {
    if (this.cart.items.length === 0) {
      return;
    }
    
    // Verificar se o usuário está autenticado antes de ir para checkout
    if (!this.isLoggedIn) {
      // Salvar intenção de ir para checkout e redirecionar para login
      this.storageService.setItem('redirectAfterLogin', '/checkout');
      this.router.navigate(['/auth/login'], { 
        queryParams: { message: 'Para finalizar sua compra, faça login ou cadastre-se.' }
      });
      return;
    }
    
    this.router.navigate(['/checkout']);
  }

  goToLogin() {
    // Método para facilitar redirecionamento para login na UI
    this.storageService.setItem('redirectAfterLogin', '/cart');
    this.router.navigate(['/auth/login'], { 
      queryParams: { message: 'Faça login para acessar recursos exclusivos e finalizar suas compras.' }
    });
  }

  goToRegister() {
    // Método para facilitar redirecionamento para registro na UI
    this.storageService.setItem('redirectAfterLogin', '/cart');
    this.router.navigate(['/auth/register'], { 
      queryParams: { message: 'Crie sua conta para finalizar suas compras e acessar recursos exclusivos.' }
    });
  }

  continueShopping() {
    this.router.navigate(['/books']);
  }

  goToBookDetails(bookId: number) {
    this.router.navigate(['/books', bookId]);
  }

  formatPrice(price: number): string {
    return `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
  }

  getGenderName(genderId: number): string {
    // Mapeamento simples dos gêneros
    const genderMap: { [key: number]: string } = {
      1: 'Ficção Científica',
      2: 'Fantasia', 
      3: 'Suspense e Mistério',
      4: 'Romance',
      5: 'Literatura Clássica',
      6: 'Biografias e Memórias',
      7: 'História',
      8: 'Tecnologia e Ciência',
      9: 'Mangás e HQs',
      10: 'Autoajuda',
      11: 'Infantojuvenil',
      12: 'Gastronomia'
    };
    
    return genderMap[genderId] || 'Gênero desconhecido';
  }

  isCartEmpty(): boolean {
    return this.cart.items.length === 0;
  }

  getTotalItems(): number {
    return this.cart.totalItems;
  }

  getTotalPrice(): number {
    return this.cart.totalPrice;
  }

  trackByBookId(index: number, item: CartItem): number {
    return item.book.id;
  }

  onQuantityInputChange(item: CartItem, event: Event): void {
    const target = event.target as HTMLInputElement;
    const newQuantity = parseInt(target.value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      this.updateQuantity(item, newQuantity);
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/book-placeholder.jpg';
  }
}
