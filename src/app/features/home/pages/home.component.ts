import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  featuredBooks = [
    {
      id: 1,
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      price: 29.90,
      originalPrice: 39.90,
      image: 'assets/images/books/dom-casmurro.jpg',
      rating: 4.8,
      discount: 25
    },
    {
      id: 2,
      title: 'O Cortiço',
      author: 'Aluísio Azevedo',
      price: 24.90,
      originalPrice: 34.90,
      image: 'assets/images/books/o-cortico.jpg',
      rating: 4.6,
      discount: 29
    },
    {
      id: 3,
      title: 'Senhora',
      author: 'José de Alencar',
      price: 19.90,
      originalPrice: 29.90,
      image: 'assets/images/books/senhora.jpg',
      rating: 4.7,
      discount: 33
    }
  ];

  // Gêneros reais do backend - selecionamos alguns principais para exibir na Home
  categories = [
    { id: 1, name: 'Ficção Científica', icon: '�', count: 4 },
    { id: 2, name: 'Fantasia', icon: '🧙‍♂️', count: 5 },
    { id: 3, name: 'Suspense e Mistério', icon: '🔍', count: 3 },
    { id: 4, name: 'Romance', icon: '💕', count: 6 },
    { id: 5, name: 'Literatura Clássica', icon: '�', count: 8 },
    { id: 6, name: 'Ficção Histórica', icon: '🏛️', count: 2 },
    { id: 7, name: 'Biografia', icon: '�', count: 3 },
    { id: 8, name: 'História', icon: '📜', count: 4 }
  ];

  // Todos os 12 gêneros reais do backend
  allGenres = [
    { id: 1, name: 'Ficção Científica', icon: '🚀', count: 4 },
    { id: 2, name: 'Fantasia', icon: '🧙‍♂️', count: 5 },
    { id: 3, name: 'Suspense e Mistério', icon: '🔍', count: 3 },
    { id: 4, name: 'Romance', icon: '💕', count: 6 },
    { id: 5, name: 'Literatura Clássica', icon: '📚', count: 8 },
    { id: 6, name: 'Biografias e Memórias', icon: '👤', count: 3 },
    { id: 7, name: 'História', icon: '📜', count: 4 },
    { id: 8, name: 'Tecnologia e Ciência', icon: '🔬', count: 2 },
    { id: 9, name: 'Mangás e HQs', icon: '📖', count: 1 },
    { id: 10, name: 'Autoajuda', icon: '💪', count: 5 },
    { id: 11, name: 'Infantojuvenil', icon: '🧸', count: 7 },
    { id: 12, name: 'Gastronomia', icon: '🍳', count: 2 }
  ];

  promotions: any[] = []; // Removido as promoções
}
