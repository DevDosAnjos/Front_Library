import { Routes } from '@angular/router';
import { AdminGuard } from '../../core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'books',
    loadComponent: () => import('./pages/books/books-management.component').then(m => m.BooksManagementComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'genres',
    loadComponent: () => import('./pages/genres/genres-management.component').then(m => m.GenresManagementComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users-management.component').then(m => m.UsersManagementComponentFixed),
    canActivate: [AdminGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders-management.component').then(m => m.OrdersManagementComponent),
    canActivate: [AdminGuard]
  }
];
