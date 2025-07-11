import { Routes } from '@angular/router';

export const routes: Routes = [
  // Rota padrão - Home
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home.component').then(m => m.HomeComponent),
    title: 'É-Livro - E-commerce de Livros'
  },

  // Rotas de autenticação (públicas)
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
    title: 'Login - É-Livro'
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent),
    title: 'Registro - É-Livro'
  },

  // Rotas de livros (públicas)
  {
    path: 'books',
    loadComponent: () => import('./features/books/pages/catalog/catalog.component').then(m => m.CatalogComponent),
    title: 'Catálogo - É-Livro'
  },

  // Rota de carrinho (pública - acesso livre)
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/pages/cart/cart.component').then(m => m.CartComponent),
    title: 'Carrinho - É-Livro'
  },

  // Rota de checkout (protegida - requer autenticação)
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/pages/checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'Checkout - É-Livro'
  },

  // Rota de sucesso do pedido (pública)
  {
    path: 'order-success',
    loadComponent: () => import('./features/checkout/pages/order-success/order-success.component').then(m => m.OrderSuccessComponent),
    title: 'Pedido Confirmado - É-Livro'
  },

  // Rotas administrativas (protegidas - requer role ADMIN)
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.routes),
    title: 'Administração - É-Livro'
  },

  // Rota para páginas não encontradas
  {
    path: '**',
    redirectTo: ''
  }
];
