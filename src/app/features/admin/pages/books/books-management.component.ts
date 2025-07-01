import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BookService } from '../../../../core/services/book.service';
import { GenderService } from '../../../../core/services/gender.service';
import { BookAdmin, Gender } from '../../../../core/models/api-models';

@Component({
  selector: 'app-books-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './books-management.component.html',
  styleUrl: './books-management.component.css'
})
export class BooksManagementComponent implements OnInit {
  books: BookAdmin[] = [];
  filteredBooks: BookAdmin[] = [];
  genres: Gender[] = [];
  
  // Form states
  showForm = false;
  editingBook: BookAdmin | null = null;
  isLoading = true;
  isSaving = false;
  
  // Form data - usando FormGroup
  bookForm: FormGroup;
  
  // Filters and search
  searchTerm = '';
  filterGenre = 'all'; // 'all' or genre ID
  filterStatus = 'all'; // 'all', 'IN_STOCK', 'OUT_OF_STOCK'

  constructor(
    private router: Router,
    private storageService: StorageService,
    private authService: AuthService,
    private bookService: BookService,
    private genderService: GenderService,
    private fb: FormBuilder
  ) {
    this.bookForm = this.createBookForm();
  }

  createBookForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      genderID: [0, Validators.required],
      statusStock: ['IN_STOCK'],
      author: [''],
      description: [''],
      stock: [0, Validators.min(0)],
      imageUrl: ['/assets/images/img-livros.jpg'],
      isbn: [''],
      publisher: [''],
      publishYear: [new Date().getFullYear(), [Validators.min(1500), Validators.max(new Date().getFullYear() + 1)]],
      pages: [0, Validators.min(0)],
      language: ['Português']
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    try {
      // Load books
      await this.loadBooks();
      // Load genres for the filter dropdown
      await this.loadGenres();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadBooks() {
    try {
      // For now, using mock data since we don't have the real service implemented
      this.books = this.getMockBooks();
      this.filteredBooks = [...this.books];
      this.applyFilters();
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
      this.books = [];
      this.filteredBooks = [];
    }
  }

  async loadGenres() {
    try {
      // Mock genres for now
      this.genres = [
        { id: 1, name: 'Ficção', statusGender: 'ACTIVE' },
        { id: 2, name: 'Romance', statusGender: 'ACTIVE' },
        { id: 3, name: 'Aventura', statusGender: 'ACTIVE' },
        { id: 4, name: 'Mistério', statusGender: 'ACTIVE' },
        { id: 5, name: 'Biografia', statusGender: 'ACTIVE' }
      ];
    } catch (error) {
      console.error('Erro ao carregar gêneros:', error);
      this.genres = [];
    }
  }

  getMockBooks(): BookAdmin[] {
    return [
      {
        id: 1,
        name: 'Dom Casmurro',
        price: 29.90,
        genderID: 1,
        statusStock: 'IN_STOCK',
        author: 'Machado de Assis',
        description: 'Um clássico da literatura brasileira',
        stock: 15,
        imageUrl: '/assets/images/img-livros.jpg',
        isbn: '978-8525406958',
        publisher: 'Editora Globo',
        publishYear: 1899,
        pages: 256,
        language: 'Português',
        priceFormatted: 'R$ 29,90',
        genderName: 'Ficção'
      },
      {
        id: 2,
        name: 'O Cortiço',
        price: 24.90,
        genderID: 1,
        statusStock: 'IN_STOCK',
        author: 'Aluísio Azevedo',
        description: 'Romance naturalista brasileiro',
        stock: 8,
        imageUrl: '/assets/images/img-livros.jpg',
        isbn: '978-8525406965',
        publisher: 'Editora Ática',
        publishYear: 1890,
        pages: 304,
        language: 'Português',
        priceFormatted: 'R$ 24,90',
        genderName: 'Ficção'
      },
      {
        id: 3,
        name: 'Senhora',
        price: 27.50,
        genderID: 2,
        statusStock: 'OUT_OF_STOCK',
        author: 'José de Alencar',
        description: 'Romance romântico brasileiro',
        stock: 0,
        imageUrl: '/assets/images/img-livros.jpg',
        isbn: '978-8525406972',
        publisher: 'Editora Moderna',
        publishYear: 1875,
        pages: 280,
        language: 'Português',
        priceFormatted: 'R$ 27,50',
        genderName: 'Romance'
      }
    ];
  }

  // Search and filter methods
  onSearchChange() {
    this.applyFilters();
  }

  onGenreFilterChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredBooks = this.books.filter(book => {
      const matchesSearch = !this.searchTerm || 
        book.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (book.author && book.author.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesGenre = this.filterGenre === 'all' || book.genderID.toString() === this.filterGenre;
      const matchesStatus = this.filterStatus === 'all' || book.statusStock === this.filterStatus;

      return matchesSearch && matchesGenre && matchesStatus;
    });
  }

  // Form methods
  openCreateForm() {
    this.editingBook = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(book: BookAdmin) {
    this.editingBook = book;
    this.bookForm.patchValue({
      name: book.name,
      price: book.price,
      genderID: book.genderID,
      statusStock: book.statusStock,
      author: book.author || '',
      description: book.description || '',
      stock: book.stock || 0,
      imageUrl: book.imageUrl || '/assets/images/img-livros.jpg',
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publishYear: book.publishYear || new Date().getFullYear(),
      pages: book.pages || 0,
      language: book.language || 'Português'
    });
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingBook = null;
    this.resetForm();
  }

  resetForm() {
    this.bookForm.reset({
      name: '',
      price: 0,
      genderID: 0,
      statusStock: 'IN_STOCK',
      author: '',
      description: '',
      stock: 0,
      imageUrl: '/assets/images/img-livros.jpg',
      isbn: '',
      publisher: '',
      publishYear: new Date().getFullYear(),
      pages: 0,
      language: 'Português'
    });
  }

  async submitForm() {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;
    try {
      if (this.editingBook) {
        await this.updateBook();
      } else {
        await this.createBook();
      }
      this.closeForm();
      await this.loadBooks();
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
    } finally {
      this.isSaving = false;
    }
  }

  validateForm(): boolean {
    const formValue = this.bookForm.value;
    if (!formValue.name?.trim()) {
      alert('Nome do livro é obrigatório');
      return false;
    }
    if (formValue.price <= 0) {
      alert('Preço deve ser maior que zero');
      return false;
    }
    if (!formValue.genderID) {
      alert('Gênero é obrigatório');
      return false;
    }
    return true;
  }

  async createBook() {
    // Mock implementation - replace with actual API call
    const formValue = this.bookForm.value;
    const newBook: BookAdmin = {
      id: Math.max(...this.books.map(b => b.id)) + 1,
      ...formValue,
      priceFormatted: `R$ ${formValue.price.toFixed(2).replace('.', ',')}`,
      genderName: this.genres.find(g => g.id === formValue.genderID)?.name || 'Desconhecido'
    };
    this.books.push(newBook);
  }

  async updateBook() {
    if (!this.editingBook) return;
    
    // Mock implementation - replace with actual API call
    const formValue = this.bookForm.value;
    const index = this.books.findIndex(b => b.id === this.editingBook!.id);
    if (index !== -1) {
      this.books[index] = {
        ...this.editingBook,
        ...formValue,
        priceFormatted: `R$ ${formValue.price.toFixed(2).replace('.', ',')}`,
        genderName: this.genres.find(g => g.id === formValue.genderID)?.name || 'Desconhecido'
      };
    }
  }

  async deleteBook(book: BookAdmin) {
    if (!confirm(`Tem certeza que deseja excluir o livro "${book.name}"?`)) {
      return;
    }

    try {
      // Mock implementation - replace with actual API call
      const index = this.books.findIndex(b => b.id === book.id);
      if (index !== -1) {
        this.books.splice(index, 1);
        this.applyFilters();
      }
    } catch (error) {
      console.error('Erro ao excluir livro:', error);
    }
  }

  onImageError(event: any) {
    event.target.src = '/assets/images/img-livros.jpg';
  }

  formatPrice(price: number): string {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  }

  getStatusClass(status: string): string {
    return status === 'IN_STOCK' ? 'status-active' : 'status-inactive';
  }

  getStatusText(status: string): string {
    return status === 'IN_STOCK' ? 'Em Estoque' : 'Fora de Estoque';
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  async saveBook() {
    await this.submitForm();
  }
}
