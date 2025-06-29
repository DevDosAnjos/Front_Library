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
    },
    {
      id: 4,
      title: 'Iracema',
      author: 'José de Alencar',
      price: 22.90,
      originalPrice: 32.90,
      image: 'assets/images/books/iracema.jpg',
      rating: 4.5,
      discount: 30
    }
  ];

  categories = [
    { name: 'Ficção', icon: '📚', count: 1250 },
    { name: 'Romance', icon: '💕', count: 890 },
    { name: 'Suspense', icon: '🔍', count: 456 },
    { name: 'Fantasia', icon: '🧙‍♂️', count: 678 },
    { name: 'Biografia', icon: '👤', count: 234 },
    { name: 'História', icon: '🏛️', count: 345 },
    { name: 'Ciência', icon: '🔬', count: 567 },
    { name: 'Infantil', icon: '🧸', count: 789 }
  ];

  promotions = [
    {
      title: 'Black Friday dos Livros',
      subtitle: 'Até 70% OFF em toda loja',
      description: 'Aproveite nossa mega promoção',
      image: 'assets/images/banners/black-friday.jpg',
      buttonText: 'Ver Ofertas'
    },
    {
      title: 'Clássicos Brasileiros',
      subtitle: 'Coleção completa com desconto',
      description: 'Os melhores da literatura nacional',
      image: 'assets/images/banners/classicos.jpg',
      buttonText: 'Explorar'
    }
  ];
}
