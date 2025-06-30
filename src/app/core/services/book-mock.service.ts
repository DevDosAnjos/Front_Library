import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Book, BookFilters } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  // Dados mocados temporários baseados nos dados reais do backend
  private mockBooks: Book[] = [
    { id: 1, name: 'Duna', price: 4500, gender_id: 1, status_stock: 'IN_STOCK' },
    { id: 2, name: 'O Guia do Mochileiro das Galáxias', price: 3500, gender_id: 1, status_stock: 'IN_STOCK' },
    { id: 3, name: 'Fundação', price: 4000, gender_id: 1, status_stock: 'OUT_OF_STOCK' },
    { id: 4, name: 'Neuromancer', price: 3800, gender_id: 1, status_stock: 'IN_STOCK' },
    { id: 5, name: 'O Senhor dos Anéis: A Sociedade do Anel', price: 5500, gender_id: 2, status_stock: 'IN_STOCK' },
    { id: 6, name: 'As Crônicas de Nárnia: O Leão, a Feiticeira e o Guarda-Roupa', price: 4200, gender_id: 2, status_stock: 'IN_STOCK' },
    { id: 7, name: 'Harry Potter e a Pedra Filosofal', price: 3900, gender_id: 2, status_stock: 'IN_STOCK' },
    { id: 8, name: 'A Guerra dos Tronos', price: 6000, gender_id: 2, status_stock: 'IN_STOCK' },
    { id: 9, name: 'O Nome da Rosa', price: 4800, gender_id: 2, status_stock: 'OUT_OF_STOCK' },
    { id: 10, name: 'O Código Da Vinci', price: 3700, gender_id: 3, status_stock: 'IN_STOCK' },
    { id: 11, name: 'Sherlock Holmes: Um Estudo em Vermelho', price: 3200, gender_id: 3, status_stock: 'IN_STOCK' },
    { id: 12, name: 'Assassinato no Expresso do Oriente', price: 3400, gender_id: 3, status_stock: 'IN_STOCK' },
    { id: 13, name: 'Orgulho e Preconceito', price: 3600, gender_id: 4, status_stock: 'IN_STOCK' },
    { id: 14, name: 'Dom Casmurro', price: 2800, gender_id: 4, status_stock: 'IN_STOCK' },
    { id: 15, name: 'O Morro dos Ventos Uivantes', price: 3300, gender_id: 4, status_stock: 'OUT_OF_STOCK' },
    { id: 16, name: 'Jane Eyre', price: 3500, gender_id: 4, status_stock: 'IN_STOCK' },
    { id: 17, name: 'Anna Karênina', price: 5200, gender_id: 4, status_stock: 'IN_STOCK' },
    { id: 18, name: 'O Pequeno Príncipe', price: 2500, gender_id: 4, status_stock: 'IN_STOCK' },
    { id: 19, name: '1984', price: 4200, gender_id: 5, status_stock: 'IN_STOCK' },
    { id: 20, name: 'Dom Quixote', price: 5800, gender_id: 5, status_stock: 'IN_STOCK' },
    { id: 21, name: 'Cem Anos de Solidão', price: 4600, gender_id: 5, status_stock: 'IN_STOCK' },
    { id: 22, name: 'O Grande Gatsby', price: 3400, gender_id: 5, status_stock: 'IN_STOCK' },
    { id: 23, name: 'Moby Dick', price: 5000, gender_id: 5, status_stock: 'OUT_OF_STOCK' },
    { id: 24, name: 'Guerra e Paz', price: 6500, gender_id: 5, status_stock: 'IN_STOCK' },
    { id: 25, name: 'Crime e Castigo', price: 4800, gender_id: 5, status_stock: 'IN_STOCK' },
    { id: 26, name: 'Os Miseráveis', price: 7200, gender_id: 5, status_stock: 'IN_STOCK' },
    { id: 27, name: 'Steve Jobs', price: 4500, gender_id: 6, status_stock: 'IN_STOCK' },
    { id: 28, name: 'Long Walk to Freedom', price: 5200, gender_id: 6, status_stock: 'IN_STOCK' },
    { id: 29, name: 'Eu Sou Malala', price: 3800, gender_id: 6, status_stock: 'IN_STOCK' },
    { id: 30, name: 'Sapiens: Uma Breve História da Humanidade', price: 4800, gender_id: 7, status_stock: 'IN_STOCK' },
    { id: 31, name: 'Uma Breve História do Tempo', price: 4200, gender_id: 7, status_stock: 'OUT_OF_STOCK' },
    { id: 32, name: 'Guns, Germs, and Steel', price: 5500, gender_id: 7, status_stock: 'IN_STOCK' },
    { id: 33, name: 'The Silk Roads', price: 5000, gender_id: 7, status_stock: 'IN_STOCK' },
    { id: 34, name: 'The Innovators', price: 4600, gender_id: 8, status_stock: 'IN_STOCK' },
    { id: 35, name: 'Algorithms to Live By', price: 4200, gender_id: 8, status_stock: 'IN_STOCK' },
    { id: 36, name: 'Naruto, Vol. 1', price: 1500, gender_id: 9, status_stock: 'IN_STOCK' },
    { id: 37, name: 'O Poder do Agora', price: 3500, gender_id: 10, status_stock: 'IN_STOCK' },
    { id: 38, name: 'Como Fazer Amigos e Influenciar Pessoas', price: 3200, gender_id: 10, status_stock: 'IN_STOCK' },
    { id: 39, name: 'Os 7 Hábitos das Pessoas Altamente Eficazes', price: 3800, gender_id: 10, status_stock: 'IN_STOCK' },
    { id: 40, name: 'Mindset: A Nova Psicologia do Sucesso', price: 3600, gender_id: 10, status_stock: 'OUT_OF_STOCK' },
    { id: 41, name: 'Quem Mexeu no Meu Queijo?', price: 2800, gender_id: 10, status_stock: 'IN_STOCK' },
    { id: 42, name: 'O Menino do Pijama Listrado', price: 2500, gender_id: 11, status_stock: 'IN_STOCK' },
    { id: 43, name: 'As Aventuras de Tom Sawyer', price: 2800, gender_id: 11, status_stock: 'IN_STOCK' },
    { id: 44, name: 'Alice no País das Maravilhas', price: 2200, gender_id: 11, status_stock: 'IN_STOCK' },
    { id: 45, name: 'Charlie e a Fábrica de Chocolate', price: 2600, gender_id: 11, status_stock: 'IN_STOCK' },
    { id: 46, name: 'O Diário de um Banana', price: 2000, gender_id: 11, status_stock: 'IN_STOCK' },
    { id: 47, name: 'Where the Crawdads Sing', price: 4200, gender_id: 11, status_stock: 'IN_STOCK' },
    { id: 48, name: 'Extraordinário', price: 3200, gender_id: 11, status_stock: 'IN_STOCK' },
    { id: 49, name: 'Salt, Fat, Acid, Heat', price: 4500, gender_id: 12, status_stock: 'IN_STOCK' },
    { id: 50, name: 'The Joy of Cooking', price: 5200, gender_id: 12, status_stock: 'IN_STOCK' }
  ];

  /**
   * Busca todos os livros com filtros opcionais
   * TODO: Substituir por chamada real da API quando backend estiver disponível
   */
  getBooks(filters?: BookFilters): Observable<Book[]> {
    // Simular delay de rede
    return of(this.filterBooks(this.mockBooks, filters)).pipe(
      delay(800) // Simula carregamento
    );
  }

  /**
   * Busca livros por gênero
   */
  getBooksByGender(genderId: number): Observable<Book[]> {
    return this.getBooks({ gender_id: genderId });
  }

  /**
   * Busca livros em estoque
   */
  getBooksInStock(): Observable<Book[]> {
    return this.getBooks({ status_stock: 'IN_STOCK' });
  }

  /**
   * Busca livros por termo de pesquisa
   */
  searchBooks(searchTerm: string): Observable<Book[]> {
    return this.getBooks({ search: searchTerm });
  }

  /**
   * Busca um livro específico por ID
   */
  getBookById(id: number): Observable<Book | undefined> {
    const book = this.mockBooks.find(b => b.id === id);
    return of(book).pipe(delay(300));
  }

  /**
   * Aplica filtros aos livros mocados
   */
  private filterBooks(books: Book[], filters?: BookFilters): Book[] {
    if (!filters) return books;

    let filteredBooks = [...books];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredBooks = filteredBooks.filter(book => 
        book.name.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.gender_id) {
      filteredBooks = filteredBooks.filter(book => 
        book.gender_id === filters.gender_id
      );
    }

    if (filters.status_stock) {
      filteredBooks = filteredBooks.filter(book => 
        book.status_stock === filters.status_stock
      );
    }

    return filteredBooks;
  }
}
