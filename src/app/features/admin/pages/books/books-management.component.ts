import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BookService } from '../../../../core/services/book.service';
import { GenderService } from '../../../../core/services/gender.service';
import { StorageService } from '../../../../core/services/storage.service';
import { Book, BookAdmin, Gender } from '../../../../core/models/api-models';

@Component({
  selector: 'app-books-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './books-management.component.html',
  styleUrl: './books-management.component.css'
})
export class BooksManagementComponent implements OnInit {
  books: BookAdmin[] = [];
  genres: Gender[] = [];
  filteredBooks: BookAdmin[] = [];
  
  bookForm: FormGroup;
  editingBook: BookAdmin | null = null;
  showForm = false;
  isLoading = true;
  isSaving = false;
  
  searchTerm = '';
  selectedGenre = '';
  selectedStatus = '';
  currentYear = new Date().getFullYear(); // Propriedade para o ano atual

  // Propriedades para ordenação e paginação
  sortBy = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  pagination = {
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookService: BookService,
    private genderService: GenderService,
    private storageService: StorageService
  ) {
    this.bookForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      author: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(1)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      genderID: ['', [Validators.required]],
      imageUrl: [''],
      isbn: [''],
      publisher: [''],
      publishedYear: [new Date().getFullYear(), [Validators.min(1000), Validators.max(new Date().getFullYear())]],
      pages: [0, [Validators.min(1)]],
      language: ['Português'],
      active: [true]
    });
  }

  ngOnInit() {
    this.checkAdminAuth();
    this.loadData();
  }

  checkAdminAuth() {
    const token = this.storageService.getItem('authToken');
    const userRole = this.storageService.getItem('userRole');
    
    if (!token || userRole !== 'ADMIN') {
      this.router.navigate(['/auth/login'], {
        queryParams: { message: 'Acesso restrito a administradores.' }
      });
      return;
    }
  }

  loadData() {
    this.isLoading = true;
    
    // Carregar dados reais da API
    Promise.all([
      this.bookService.getBooks().toPromise(),
      this.genderService.getAllGenders().toPromise()
    ]).then(([books, genres]) => {
      // Mapear books para BookAdmin format para compatibilidade com o template
      this.books = (books || []).map((book: any) => ({
        ...book,
        author: 'Autor não especificado', // Campo padrão, pode ser melhorado futuramente
        description: 'Descrição não disponível',
        stock: book.statusStock === 'IN_STOCK' ? 10 : 0, // Valor padrão
        imageUrl: '',
        isbn: '',
        publisher: '',
        publishYear: new Date().getFullYear(),
        pages: 0,
        language: 'Português'
      }));
      this.genres = genres || [];
      this.applyFilters();
      this.isLoading = false;
    }).catch(error => {
      console.error('Erro ao carregar dados:', error);
      this.books = [];
      this.genres = [];
      this.isLoading = false;
    });
  }

  applyFilters() {
    let filtered = [...this.books];
    
    // Filtro por texto
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(book => 
        book.name.toLowerCase().includes(term) ||
        (book.author && book.author.toLowerCase().includes(term)) ||
        (book.description && book.description.toLowerCase().includes(term))
      );
    }
    
    // Filtro por gênero
    if (this.selectedGenre) {
      filtered = filtered.filter(book => book.genderID.toString() === this.selectedGenre);
    }
    
    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'author':
          aValue = a.author;
          bValue = b.author;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stock || 0;
          bValue = b.stock || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (this.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    // Paginação
    this.pagination.totalItems = filtered.length;
    this.pagination.totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
    
    const startIndex = (this.pagination.page - 1) * this.pagination.itemsPerPage;
    const endIndex = startIndex + this.pagination.itemsPerPage;
    
    this.filteredBooks = filtered.slice(startIndex, endIndex);
  }

  onSearch() {
    this.pagination.page = 1;
    this.applyFilters();
  }

  onGenreFilter() {
    this.pagination.page = 1;
    this.applyFilters();
  }

  onSort() {
    this.applyFilters();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pagination.page = page;
      this.applyFilters();
    }
  }

  openForm(book?: BookAdmin) {
    this.editingBook = book || null;
    this.showForm = true;
    
    if (book) {
      this.bookForm.patchValue({
        name: book.name,
        author: book.author || '',
        description: book.description || '',
        price: book.price / 100, // Converter de centavos para reais
        stock: book.stock || 0,
        genderID: book.genderID,
        imageUrl: book.imageUrl || '',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        publishedYear: book.publishYear || new Date().getFullYear(),
        pages: book.pages || 0,
        language: 'Português',
        active: book.statusStock === 'IN_STOCK'
      });
    } else {
      this.bookForm.reset({
        name: '',
        author: '',
        description: '',
        price: 0,
        stock: 0,
        genderID: '',
        imageUrl: '',
        isbn: '',
        publisher: '',
        publishedYear: new Date().getFullYear(),
        pages: 0,
        language: 'Português',
        active: true
      });
    }
  }

  closeForm() {
    this.showForm = false;
    this.editingBook = null;
    this.bookForm.reset();
  }

  saveBook() {
    if (this.bookForm.valid) {
      this.isSaving = true;
      const formData = this.bookForm.value;
      
      const bookData = {
        name: formData.name,
        price: Math.round(formData.price * 100), // Converter para centavos
        genderID: parseInt(formData.genderID),
        statusStock: (formData.stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK') as 'IN_STOCK' | 'OUT_OF_STOCK'
      };

      const operation = this.editingBook 
        ? this.bookService.updateBook(this.editingBook.id, bookData)
        : this.bookService.createBook(bookData);

      operation.subscribe({
        next: (savedBook) => {
          if (this.editingBook) {
            // Atualizar livro existente na lista local
            const index = this.books.findIndex(b => b.id === this.editingBook!.id);
            if (index >= 0) {
              this.books[index] = {
                ...savedBook,
                author: formData.author || 'Autor não especificado',
                description: formData.description || 'Descrição não disponível',
                stock: formData.stock || 0,
                imageUrl: formData.imageUrl || '',
                isbn: formData.isbn || '',
                publisher: formData.publisher || '',
                publishYear: formData.publishedYear || new Date().getFullYear(),
                pages: formData.pages || 0,
                language: formData.language || 'Português'
              };
            }
          } else {
            // Adicionar novo livro à lista local
            const newBook: BookAdmin = {
              ...savedBook,
              author: formData.author || 'Autor não especificado',
              description: formData.description || 'Descrição não disponível',
              stock: formData.stock || 0,
              imageUrl: formData.imageUrl || '',
              isbn: formData.isbn || '',
              publisher: formData.publisher || '',
              publishYear: formData.publishedYear || new Date().getFullYear(),
              pages: formData.pages || 0,
              language: formData.language || 'Português'
            };
            this.books.push(newBook);
          }
          
          this.applyFilters();
          this.closeForm();
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Erro ao salvar livro:', error);
          this.isSaving = false;
          // Aqui você pode adicionar uma notificação de erro
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  deleteBook(book: BookAdmin) {
    if (confirm(`Tem certeza que deseja excluir o livro "${book.name}"?`)) {
      this.bookService.deleteBook(book.id).subscribe({
        next: () => {
          const index = this.books.findIndex(b => b.id === book.id);
          if (index >= 0) {
            this.books.splice(index, 1);
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Erro ao deletar livro:', error);
          // Aqui você pode adicionar uma notificação de erro
        }
      });
    }
  }

  toggleBookStatus(book: BookAdmin) {
    const newStatus = book.statusStock === 'IN_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK';
    
    const updateData = {
      name: book.name,
      price: book.price,
      genderID: book.genderID,
      statusStock: newStatus as 'IN_STOCK' | 'OUT_OF_STOCK'
    };

    this.bookService.updateBook(book.id, updateData).subscribe({
      next: (updatedBook) => {
        const index = this.books.findIndex(b => b.id === book.id);
        if (index >= 0) {
          this.books[index] = { ...this.books[index], ...updatedBook };
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar status do livro:', error);
        // Aqui você pode adicionar uma notificação de erro
      }
    });
  }

  formatPrice(price: number): string {
    return `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
  }

  getGenreName(genderId: number): string {
    const genre = this.genres.find(g => g.id === genderId);
    return genre ? genre.name : 'Gênero não encontrado';
  }

  getFieldError(fieldName: string): string {
    const field = this.bookForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} é obrigatório`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${this.getFieldDisplayName(fieldName)} deve ser maior que ${field.errors['min'].min - 1}`;
      }
      if (field.errors['max']) {
        return `${this.getFieldDisplayName(fieldName)} deve ser menor que ${field.errors['max'].max + 1}`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      name: 'Nome',
      author: 'Autor',
      description: 'Descrição',
      price: 'Preço',
      stock: 'Estoque',
      genderID: 'Gênero',
      isbn: 'ISBN',
      publisher: 'Editora',
      publishedYear: 'Ano de publicação',
      pages: 'Páginas',
      language: 'Idioma'
    };
    
    return displayNames[fieldName] || fieldName;
  }

  private markFormGroupTouched() {
    Object.keys(this.bookForm.controls).forEach(key => {
      const control = this.bookForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
