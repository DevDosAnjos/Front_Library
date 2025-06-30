import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'success',
    loadComponent: () => import('./pages/order-success/order-success.component').then(m => m.OrderSuccessComponent)
  }
];
