import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  searchQuery = '';
  isMenuOpen = false;
  cartItemsCount = 0;
  isLoggedIn = false;
  userName = '';

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    // Verificar se usuário está logado
    this.checkAuthStatus();
    // Verificar itens no carrinho
    this.updateCartCount();
  }

  checkAuthStatus() {
    const token = this.storageService.getItem('authToken');
    this.isLoggedIn = !!token;
    if (this.isLoggedIn) {
      this.userName = this.storageService.getItem('userName') || 'Usuário';
    }
  }

  updateCartCount() {
    // Simular contagem de itens no carrinho
    // Em uma implementação real, isso viria de um serviço
    const cartItems = this.storageService.getObject<any[]>('cartItems');
    this.cartItemsCount = cartItems ? cartItems.length : 0;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/books'], { 
        queryParams: { search: this.searchQuery } 
      });
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goToCart() {
    if (this.isLoggedIn) {
      this.router.navigate(['/cart']);
    } else {
      this.router.navigate(['/auth/login']);
    }
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
