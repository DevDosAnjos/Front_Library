import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
   * Alinhado com backend: GET /api/book/all (permitAll conforme SecurityConfig)
   */
  getBooks(filters?: BookFilters): Observable<Book[]> {
    let endpoint = 'book/all';
    let params: any = {};

    console.log('🔄 BookService.getBooks() - Iniciando busca de livros...');

    // Aplicar filtros se fornecidos
    if (filters) {
      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.genderID) {
        params.genderID = filters.genderID;
      }
      if (filters.statusStock && filters.statusStock !== 'ALL') {
        params.statusStock = filters.statusStock;
      }
      console.log('📋 Filtros aplicados:', params);
    }

    return this.apiService.get<BookResponse[]>(endpoint, params).pipe(
      map(books => {
        console.log(`✅ BookService: Recebidos ${books.length} livros do backend`);
        const mappedBooks = books.map(book => this.mapBookResponseToBook(book));
        console.log('📝 Livros mapeados:', mappedBooks.slice(0, 2)); // Log apenas os 2 primeiros
        return mappedBooks;
      }),
      catchError((error: any) => {
        console.error('❌ BookService.getBooks() - Erro na API:', error);
        console.error('🔍 Detalhes do erro:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        throw error; // Re-throw para que o dashboard possa capturar
      })
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
   * Conta quantos livros existem por gênero
   * Útil para o dashboard de gêneros
   * Com fallback robusto em caso de erro na API de livros
   */
  countBooksByGender(): Observable<Map<number, number>> {
    console.log('🔄 BookService.countBooksByGender() - Iniciando contagem...');
    
    return this.getBooks().pipe(
      map(books => {
        const countMap = new Map<number, number>();
        books.forEach(book => {
          const genderId = book.genderID;
          countMap.set(genderId, (countMap.get(genderId) || 0) + 1);
        });
        console.log(`✅ Contagem por gênero concluída. ${countMap.size} gêneros têm livros.`);
        return countMap;
      }),
      catchError((error: any) => {
        console.error('❌ BookService.countBooksByGender() - Erro ao contar livros:', error);
        console.log('🔄 Retornando Map vazio como fallback...');
        // Retorna Map vazio para não quebrar o dashboard de gêneros
        return of(new Map<number, number>());
      })
    );
  }

  /**
   * Mapeia BookResponse do backend para Book do frontend
   */
  private mapBookResponseToBook(bookResponse: BookResponse): Book {
    return {
      id: typeof bookResponse.id === 'string' ? parseInt(bookResponse.id) : bookResponse.id,
      name: bookResponse.name,
      price: bookResponse.price,
      genderID: bookResponse.genderID || bookResponse.gender?.id || 0,
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
