import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';
import { 
  Book, 
  BookFilters, 
  BookCreateRequest, 
  BookUpdateRequest, 
  BookResponse 
} from '../models/api-models';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
  ) {}

  /**
   * Busca todos os livros com filtros opcionais
   * Alinhado com backend: GET /api/book/all (permitAll)
   */
  getBooks(filters?: BookFilters): Observable<Book[]> {
    return this.apiService.get<BookResponse[]>('book/all').pipe(
      map(books => books.map(book => this.mapBookResponseToBook(book)))
    );
  }

  /**
   * Busca livros em estoque (apenas usuários autenticados)
   * Alinhado com backend: GET /api/book/inStock (authenticated)
   */
  getBooksInStock(): Observable<Book[]> {
    return this.apiService.get<BookResponse[]>('book/inStock').pipe(
      map(books => books.map(book => this.mapBookResponseToBook(book)))
    );
  }

  /**
   * Busca livros fora de estoque (apenas admin)
   * Alinhado com backend: GET /api/book/outOfStock (hasRole ADMIN)
   */
  getBooksOutOfStock(): Observable<Book[]> {
    return this.apiService.get<BookResponse[]>('book/outOfStock').pipe(
      map(books => books.map(book => this.mapBookResponseToBook(book)))
    );
  }

  /**
   * Busca livros por gênero específico
   * Alinhado com backend: GET /api/book/gender/{genderId} (authenticated)
   */
  getBooksByGender(genderId: number): Observable<Book[]> {
    return this.apiService.get<BookResponse[]>(`book/gender/${genderId}`).pipe(
      map(books => books.map(book => this.mapBookResponseToBook(book)))
    );
  }

  /**
   * Cria um novo livro (ADMIN apenas)
   * Alinhado com backend: POST /api/book (hasRole ADMIN)
   */
  createBook(bookData: BookCreateRequest): Observable<Book> {
    return this.apiService.post<BookResponse>('book', bookData).pipe(
      map(book => this.mapBookResponseToBook(book))
    );
  }

  /**
   * Atualiza um livro (ADMIN apenas)
   * Alinhado com backend: PUT /api/book/{id} (hasRole ADMIN)
   */
  updateBook(id: number, bookData: BookUpdateRequest): Observable<Book> {
    return this.apiService.put<BookResponse>(`book/${id}`, bookData).pipe(
      map(book => this.mapBookResponseToBook(book))
    );
  }

  /**
   * Deleta um livro (ADMIN apenas)
   * Alinhado com backend: DELETE /api/book/{id} (hasRole ADMIN)
   */
  deleteBook(id: number): Observable<boolean> {
    return this.apiService.delete(`book/${id}`).pipe(
      map(() => true)
    );
  }

  /**
   * Mapeia BookResponse do backend para Book do frontend
   */
  private mapBookResponseToBook(bookResponse: BookResponse): Book {
    return {
      id: parseInt(bookResponse.id),
      name: bookResponse.name,
      price: bookResponse.price,
      genderID: bookResponse.genderID,
      statusStock: bookResponse.statusStock,
      priceFormatted: this.formatPrice(bookResponse.price)
    };
  }

  /**
   * Formata preço de centavos para string em reais
   */
  private formatPrice(priceInCents: number): string {
    const priceInReais = priceInCents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(priceInReais);
  }
}
