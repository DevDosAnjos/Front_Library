import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { Book, CartItem, Cart } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'shopping_cart';
  
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$ = this.cartSubject.asObservable();

  constructor(private storageService: StorageService) {
    // Carrega carrinho do storage na inicialização
    this.loadCartFromStorage();
  }

  /**
   * Adiciona um livro ao carrinho
   */
  addToCart(book: Book, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.items.findIndex(item => item.book.id === book.id);

    if (existingItemIndex >= 0) {
      // Se o livro já existe, atualiza a quantidade
      currentCart.items[existingItemIndex].quantity += quantity;
      currentCart.items[existingItemIndex].subtotal = 
        currentCart.items[existingItemIndex].quantity * book.price;
    } else {
      // Se é um novo livro, adiciona ao carrinho
      const newItem: CartItem = {
        book,
        quantity,
        subtotal: book.price * quantity
      };
      currentCart.items.push(newItem);
    }

    this.updateCart(currentCart);
  }

  /**
   * Remove um livro do carrinho
   */
  removeFromCart(bookId: number): void {
    const currentCart = this.cartSubject.value;
    currentCart.items = currentCart.items.filter(item => item.book.id !== bookId);
    this.updateCart(currentCart);
  }

  /**
   * Atualiza a quantidade de um item no carrinho
   */
  updateItemQuantity(bookId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(bookId);
      return;
    }

    const currentCart = this.cartSubject.value;
    const itemIndex = currentCart.items.findIndex(item => item.book.id === bookId);

    if (itemIndex >= 0) {
      currentCart.items[itemIndex].quantity = quantity;
      currentCart.items[itemIndex].subtotal = 
        currentCart.items[itemIndex].book.price * quantity;
      this.updateCart(currentCart);
    }
  }

  /**
   * Limpa todo o carrinho
   */
  clearCart(): void {
    const emptyCart = this.getInitialCart();
    this.updateCart(emptyCart);
  }

  /**
   * Obtém o carrinho atual
   */
  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  /**
   * Obtém a quantidade de itens no carrinho
   */
  getCartItemsCount(): number {
    return this.cartSubject.value.totalItems;
  }

  /**
   * Obtém o total do carrinho
   */
  getCartTotal(): number {
    return this.cartSubject.value.totalPrice;
  }

  /**
   * Verifica se um livro está no carrinho
   */
  isBookInCart(bookId: number): boolean {
    return this.cartSubject.value.items.some(item => item.book.id === bookId);
  }

  /**
   * Obtém a quantidade de um livro específico no carrinho
   */
  getBookQuantityInCart(bookId: number): number {
    const item = this.cartSubject.value.items.find(item => item.book.id === bookId);
    return item ? item.quantity : 0;
  }

  /**
   * Atualiza o carrinho e salva no storage
   */
  private updateCart(cart: Cart): void {
    // Recalcula totais
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.subtotal, 0);

    // Atualiza subject e storage
    this.cartSubject.next(cart);
    this.saveCartToStorage(cart);
  }

  /**
   * Carrega carrinho do storage
   */
  private loadCartFromStorage(): void {
    const savedCart = this.storageService.getObject<Cart>(this.CART_STORAGE_KEY);
    if (savedCart) {
      this.cartSubject.next(savedCart);
    }
  }

  /**
   * Salva carrinho no storage
   */
  private saveCartToStorage(cart: Cart): void {
    this.storageService.setObject(this.CART_STORAGE_KEY, cart);
  }

  /**
   * Cria um carrinho vazio inicial
   */
  private getInitialCart(): Cart {
    return {
      items: [],
      totalPrice: 0,
      totalItems: 0
    };
  }

  /**
   * Formata preço para exibição
   */
  formatPrice(priceInCents: number): string {
    const priceInReais = priceInCents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(priceInReais);
  }

  /**
   * Obtém resumo do carrinho para checkout
   */
  getCartSummary(): {
    items: {book_id: number, quantity: number}[],
    totalPrice: number,
    totalItems: number
  } {
    const cart = this.cartSubject.value;
    return {
      items: cart.items.map(item => ({
        book_id: item.book.id,
        quantity: item.quantity
      })),
      totalPrice: cart.totalPrice,
      totalItems: cart.totalItems
    };
  }
}
