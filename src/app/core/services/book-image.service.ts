import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookImageService {
  private readonly DEFAULT_BOOK_IMAGE = '/assets/images/img-livros.jpg';

  /**
   * Retorna a URL da imagem do livro ou a imagem padrão se não houver
   * @param imageUrl URL da imagem do livro (pode ser null/undefined)
   * @returns URL da imagem a ser exibida
   */
  getBookImageUrl(imageUrl?: string | null): string {
    return imageUrl || this.DEFAULT_BOOK_IMAGE;
  }

  /**
   * Retorna a URL da imagem padrão dos livros
   * @returns URL da imagem padrão
   */
  getDefaultBookImage(): string {
    return this.DEFAULT_BOOK_IMAGE;
  }
}
