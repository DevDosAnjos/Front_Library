import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { BookAdmin, CartItem, Cart } from '../models/api-models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_PREFIX = 'shopping_cart_user_';
  private currentUsername: string | null = null;
  private initialized = false;
  
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$ = this.cartSubject.asObservable().pipe(
    distinctUntilChanged((prev, curr) => 
      prev.totalItems === curr.totalItems && 
      prev.totalPrice === curr.totalPrice &&
      prev.items.length === curr.items.length
    ),
    shareReplay(1)
  );

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {
    if (!this.initialized) {
      console.log('CartService: Inicializando...');
      this.initialized = true;
      this.loadCartFromStorage();
      
      // Escuta mudanças no estado de autenticação com distinctUntilChanged
      this.authService.currentUser$.pipe(
        distinctUntilChanged((prev, curr) => prev?.username === curr?.username)
      ).subscribe(user => {
        const newUsername = user?.username || null;
        if (this.currentUsername !== newUsername) {
          console.log('CartService: Usuário mudou de', this.currentUsername, 'para', newUsername);
          this.currentUsername = newUsername;
          this.handleUserChange(user);
        }
      });
    }
  }

  /**
   * Lida com mudança de usuário (login/logout)
   */
  private handleUserChange(user: any): void {
    console.log('CartService.handleUserChange: Carregando carrinho para usuário:', user?.username || 'anônimo');
    this.loadCartFromStorage();
  }

  /**
   * Obtém a chave de storage específica do usuário
   */
  private getCartStorageKey(): string {
    const currentUser = this.authService.getCurrentUserData();
    if (currentUser && currentUser.username) {
      return `${this.CART_STORAGE_PREFIX}${currentUser.username}`;
    }
    return `${this.CART_STORAGE_PREFIX}anonymous`;
  }

  /**
   * Adiciona um livro ao carrinho
   */
  addToCart(book: BookAdmin, quantity: number = 1): void {
    console.log('CartService.addToCart: Adicionando livro ao carrinho:', book.name, 'quantidade:', quantity);
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.items.findIndex(item => item.book.id === book.id);

    if (existingItemIndex >= 0) {
      // Item já existe, atualiza quantidade
      currentCart.items[existingItemIndex].quantity += quantity;
      currentCart.items[existingItemIndex].subtotal = 
        currentCart.items[existingItemIndex].quantity * book.price;
      console.log('CartService.addToCart: Item já existe, nova quantidade:', currentCart.items[existingItemIndex].quantity);
    } else {
      // Novo item
      const newItem: CartItem = {
        book: book,
        quantity: quantity,
        subtotal: quantity * book.price
      };
      currentCart.items.push(newItem);
      console.log('CartService.addToCart: Novo item adicionado');
    }

    this.updateCartTotals(currentCart);
    this.cartSubject.next(currentCart);
    this.saveCartToStorage(currentCart);
  }

  /**
   * Remove um livro do carrinho
   */
  removeFromCart(bookId: number): void {
    console.log('CartService.removeFromCart: Removendo livro ID:', bookId);
    const currentCart = this.cartSubject.value;
    currentCart.items = currentCart.items.filter(item => item.book.id !== bookId);
    
    this.updateCartTotals(currentCart);
    this.cartSubject.next(currentCart);
    this.saveCartToStorage(currentCart);
  }

  /**
   * Atualiza a quantidade de um item no carrinho
   */
  updateQuantity(bookId: number, quantity: number): void {
    console.log('CartService.updateQuantity: Atualizando quantidade do livro ID:', bookId, 'para:', quantity);
    if (quantity <= 0) {
      this.removeFromCart(bookId);
      return;
    }

    const currentCart = this.cartSubject.value;
    const itemIndex = currentCart.items.findIndex(item => item.book.id === bookId);
    
    if (itemIndex >= 0) {
      currentCart.items[itemIndex].quantity = quantity;
      currentCart.items[itemIndex].subtotal = quantity * currentCart.items[itemIndex].book.price;
      
      this.updateCartTotals(currentCart);
      this.cartSubject.next(currentCart);
      this.saveCartToStorage(currentCart);
    }
  }

  /**
   * Limpa o carrinho
   */
  clearCart(): void {
    console.log('CartService.clearCart: Limpando carrinho do usuário atual');
    const emptyCart = this.getInitialCart();
    this.cartSubject.next(emptyCart);
    this.storageService.removeItem(this.getCartStorageKey());
  }

  /**
   * Obtém o carrinho atual
   */
  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  /**
   * Observable para quantidade total de itens no carrinho
   */
  getTotalItems(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart.totalItems),
      distinctUntilChanged()
    );
  }

  /**
   * Observable para preço total do carrinho
   */
  getTotalPrice(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart.totalPrice),
      distinctUntilChanged()
    );
  }

  /**
   * Verifica se um livro está no carrinho
   */
  isInCart(bookId: number): Observable<boolean> {
    return this.cart$.pipe(
      map(cart => cart.items.some(item => item.book.id === bookId))
    );
  }

  /**
   * Obtém a quantidade de um livro específico no carrinho
   */
  getItemQuantity(bookId: number): Observable<number> {
    return this.cart$.pipe(
      map(cart => {
        const item = cart.items.find(item => item.book.id === bookId);
        return item ? item.quantity : 0;
      })
    );
  }

  /**
   * Atualiza os totais do carrinho
   */
  private updateCartTotals(cart: Cart): void {
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.subtotal, 0);
    cart.updatedAt = new Date();
  }

  /**
   * Carrega o carrinho do localStorage para o usuário atual
   */
  private loadCartFromStorage(): void {
    try {
      const cartKey = this.getCartStorageKey();
      const savedCart = this.storageService.getItem(cartKey);
      
      if (savedCart) {
        const cart: Cart = JSON.parse(savedCart);
        // Converter updatedAt de string para Date se necessário
        if (cart.updatedAt && typeof cart.updatedAt === 'string') {
          cart.updatedAt = new Date(cart.updatedAt);
        }
        this.cartSubject.next(cart);
      } else {
        // Só loga se não houver carrinho salvo e for a primeira vez
        if (!this.cartSubject.value.items.length) {
          console.log('CartService.loadCartFromStorage: Nenhum carrinho salvo encontrado para', this.currentUsername || 'anônimo');
        }
        this.cartSubject.next(this.getInitialCart());
      }
    } catch (error) {
      console.error('CartService.loadCartFromStorage: Erro ao carregar carrinho:', error);
      // Em caso de erro, usa carrinho vazio
      this.cartSubject.next(this.getInitialCart());
    }
  }

  /**
   * Salva o carrinho no localStorage para o usuário atual
   */
  private saveCartToStorage(cart: Cart): void {
    try {
      const cartKey = this.getCartStorageKey();
      this.storageService.setItem(cartKey, JSON.stringify(cart));
    } catch (error) {
      console.error('CartService.saveCartToStorage: Erro ao salvar carrinho:', error);
    }
  }

  /**
   * Cria um carrinho vazio inicial
   */
  private getInitialCart(): Cart {
    return {
      items: [],
      totalPrice: 0,
      totalItems: 0,
      updatedAt: new Date()
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
   * Retorna um resumo do carrinho para checkout
   */
  getCartSummary(): Cart {
    return this.cartSubject.value;
  }

  /**
   * Migra carrinho de usuário anônimo para usuário logado (opcional)
   */
  migrateAnonymousCart(): void {
    console.log('CartService.migrateAnonymousCart: Verificando migração de carrinho anônimo');
    
    const anonymousCartKey = `${this.CART_STORAGE_PREFIX}anonymous`;
    const anonymousCart = this.storageService.getItem(anonymousCartKey);
    
    if (anonymousCart) {
      try {
        const cart: Cart = JSON.parse(anonymousCart);
        if (cart.items && cart.items.length > 0) {
          console.log('CartService.migrateAnonymousCart: Migrando', cart.items.length, 'itens do carrinho anônimo');
          
          // Adiciona itens do carrinho anônimo ao carrinho do usuário logado
          const currentCart = this.cartSubject.value;
          cart.items.forEach(item => {
            this.addToCart(item.book, item.quantity);
          });
          
          // Remove carrinho anônimo
          this.storageService.removeItem(anonymousCartKey);
          console.log('CartService.migrateAnonymousCart: Migração concluída');
        }
      } catch (error) {
        console.error('CartService.migrateAnonymousCart: Erro na migração:', error);
      }
    }
  }
}
