import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Rota padrão - Home
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(m => m.routes)
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

  // Rotas de gêneros (públicas)
  {
    path: 'genres',
    loadChildren: () => import('./features/genres/genres.routes').then(m => m.routes)
  },

  // Rotas de usuário (privadas)
  {
    path: 'profile',
    loadChildren: () => import('./features/users/users.routes').then(m => m.routes),
    canActivate: [AuthGuard]
  },

  // Rotas de carrinho (privadas)
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.routes').then(m => m.routes),
    canActivate: [AuthGuard]
  },

  // Rotas de checkout (privadas)
  {
    path: 'checkout',
    loadChildren: () => import('./features/checkout/checkout.routes').then(m => m.routes),
    canActivate: [AuthGuard]
  },

  // Rotas de pedidos (privadas)
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.routes').then(m => m.routes),
    canActivate: [AuthGuard]
  },

  // Rotas de administração (apenas admin)
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.routes),
    canActivate: [AuthGuard, AdminGuard]
  },

  // Rota para páginas não encontradas
  {
    path: '**',
    redirectTo: ''
  }
];
