import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../../core/services/book.service';
import { GenderService } from '../../../../core/services/gender.service';
import { CartService } from '../../../../core/services/cart.service';
import { Book, Gender } from '../../../../core/models/api-models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {
  books: Book[] = [];
  genders: Gender[] = [];
  isLoading = false;
  
  // Filtros
  searchTerm = '';
  selectedGenderId: number | null = null;
  selectedStock: 'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK' = 'ALL';
  sortBy: 'name' | 'price' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(
    private bookService: BookService,
    private genderService: GenderService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGenders();
    this.loadBooks();
    this.handleRouteParams();
  }

  handleRouteParams() {
    this.route.queryParams.subscribe(params => {
      if (params['genderID']) {
        this.selectedGenderId = +params['genderID'];
      }
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      this.loadBooks();
    });
  }

  loadGenders() {
    this.genderService.getActiveGenders().subscribe({
      next: (genders) => {
        this.genders = genders;
      },
      error: (error) => {
        console.error('Erro ao carregar gêneros:', error);
      }
    });
  }

  loadBooks() {
    this.isLoading = true;
    
    const filters = {
      search: this.searchTerm || undefined,
      genderID: this.selectedGenderId || undefined,
      statusStock: this.selectedStock === 'ALL' ? undefined : this.selectedStock
    };

    this.bookService.getBooks(filters).subscribe({
      next: (books) => {
        this.books = this.sortBooks(books);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar livros:', error);
        this.isLoading = false;
      }
    });
  }

  sortBooks(books: Book[]): Book[] {
    return books.sort((a, b) => {
      let comparison = 0;
      
      if (this.sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (this.sortBy === 'price') {
        comparison = a.price - b.price;
      }
      
      return this.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  onSearch() {
    this.updateUrlParams();
    this.loadBooks();
  }

  onGenderChange() {
    this.updateUrlParams();
    this.loadBooks();
  }

  onStockChange() {
    this.loadBooks();
  }

  onSortChange() {
    this.books = this.sortBooks([...this.books]);
  }

  updateUrlParams() {
    const queryParams: any = {};
    
    if (this.searchTerm) {
      queryParams.search = this.searchTerm;
    }
    
    if (this.selectedGenderId) {
      queryParams.genderID = this.selectedGenderId;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace'
    });
  }

  addToCart(book: Book) {
    if (book.statusStock === 'OUT_OF_STOCK') {
      return;
    }
    
    this.cartService.addToCart(book, 1);
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedGenderId = null;
    this.selectedStock = 'ALL';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'replace'
    });
    this.loadBooks();
  }

  formatPrice(price: number): string {
    return `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
  }

  getGenderName(genderId: number): string {
    const gender = this.genders.find(g => g.id === genderId);
    return gender?.name || 'Gênero desconhecido';
  }

  isInStock(book: Book): boolean {
    return book.statusStock === 'IN_STOCK';
  }
}
