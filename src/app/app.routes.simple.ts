import { Routes } from '@angular/router';

export const routes: Routes = [
  // Rota padrão - Redirecionamento para livros
  {
    path: '',
    redirectTo: '/books',
    pathMatch: 'full'
  },

  // Rotas de autenticação (públicas)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.routes)
  },

  // Rotas de livros (públicas)
  {
    path: 'books',
    loadChildren: () => import('./features/books/books.routes').then(m => m.routes)
  },

  // Rota de carrinho (pública - acesso livre)
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/pages/cart/cart.component').then(m => m.CartComponent),
    title: 'Carrinho - É-Livro'
  },

  // Rota para páginas não encontradas
  {
    path: '**',
    redirectTo: '/books'
  }
];
