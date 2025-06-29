import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Book, BookFilters, PaginatedResponse, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(private apiService: ApiService) {}

  /**
   * Busca todos os livros com filtros opcionais
   */
  getBooks(filters?: BookFilters): Observable<Book[]> {
    const params = this.buildFilterParams(filters);
    return this.apiService.get<ApiResponse<Book[]>>('books', params).pipe(
      map(response => response.data.map(book => ({
        ...book,
        priceFormatted: this.formatPrice(book.price),
        gender: book.gender // Se a API retornar o gênero populado
      })))
    );
  }

  /**
   * Busca livros com paginação
   */
  getBooksPaginated(filters?: BookFilters): Observable<PaginatedResponse<Book>> {
    const params = this.buildFilterParams(filters);
    return this.apiService.get<PaginatedResponse<Book>>('books/paginated', params).pipe(
      map(response => ({
        ...response,
        data: response.data.map(book => ({
          ...book,
          priceFormatted: this.formatPrice(book.price)
        }))
      }))
    );
  }

  /**
   * Busca um livro específico por ID
   */
  getBookById(id: number): Observable<Book> {
    return this.apiService.get<ApiResponse<Book>>(`books/${id}`).pipe(
      map(response => ({
        ...response.data,
        priceFormatted: this.formatPrice(response.data.price)
      }))
    );
  }

  /**
   * Busca livros por gênero
   */
  getBooksByGender(genderId: number, filters?: Omit<BookFilters, 'gender_id'>): Observable<Book[]> {
    const params = this.buildFilterParams({ ...filters, gender_id: genderId });
    return this.getBooks(params);
  }

  /**
   * Busca livros em estoque
   */
  getBooksInStock(filters?: Omit<BookFilters, 'status_stock'>): Observable<Book[]> {
    const params = this.buildFilterParams({ ...filters, status_stock: 'IN_STOCK' });
    return this.getBooks(params);
  }

  /**
   * Busca livros por termo de pesquisa
   */
  searchBooks(searchTerm: string, filters?: Omit<BookFilters, 'search'>): Observable<Book[]> {
    const params = this.buildFilterParams({ ...filters, search: searchTerm });
    return this.getBooks(params);
  }

  /**
   * Cria um novo livro (ADMIN apenas)
   */
  createBook(book: Omit<Book, 'id' | 'priceFormatted'>): Observable<Book> {
    return this.apiService.post<ApiResponse<Book>>('books', book).pipe(
      map(response => ({
        ...response.data,
        priceFormatted: this.formatPrice(response.data.price)
      }))
    );
  }

  /**
   * Atualiza um livro (ADMIN apenas)
   */
  updateBook(id: number, book: Partial<Omit<Book, 'id' | 'priceFormatted'>>): Observable<Book> {
    return this.apiService.put<ApiResponse<Book>>(`books/${id}`, book).pipe(
      map(response => ({
        ...response.data,
        priceFormatted: this.formatPrice(response.data.price)
      }))
    );
  }

  /**
   * Deleta um livro (ADMIN apenas)
   */
  deleteBook(id: number): Observable<void> {
    return this.apiService.delete<void>(`books/${id}`);
  }

  /**
   * Busca livros relacionados/similares
   */
  getRelatedBooks(bookId: number, limit: number = 4): Observable<Book[]> {
    return this.apiService.get<ApiResponse<Book[]>>(`books/${bookId}/related`, { limit }).pipe(
      map(response => response.data.map(book => ({
        ...book,
        priceFormatted: this.formatPrice(book.price)
      })))
    );
  }

  /**
   * Constrói parâmetros de filtro para a API
   */
  private buildFilterParams(filters?: BookFilters): any {
    if (!filters) return {};

    const params: any = {};

    if (filters.search) params.search = filters.search;
    if (filters.gender_id) params.gender_id = filters.gender_id;
    if (filters.status_stock) params.status_stock = filters.status_stock;
    if (filters.priceMin) params.priceMin = filters.priceMin;
    if (filters.priceMax) params.priceMax = filters.priceMax;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    return params;
  }

  /**
   * Formata preço de centavos para string formatada
   */
  private formatPrice(priceInCents: number): string {
    const priceInReais = priceInCents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(priceInReais);
  }
}
