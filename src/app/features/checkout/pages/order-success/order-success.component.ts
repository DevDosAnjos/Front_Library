import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.css'
})
export class OrderSuccessComponent implements OnInit {
  orderId: string = '';
  orderData: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'];
      if (this.orderId) {
        this.loadOrderData();
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  loadOrderData() {
    const orderKey = `order_${this.orderId}`;
    this.orderData = this.storageService.getObject(orderKey);
    this.isLoading = false;
    
    if (!this.orderData) {
      this.router.navigate(['/']);
    }
  }

  formatPrice(price: number): string {
    return `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
  }

  getGenderName(genderId: number): string {
    const genderMap: { [key: number]: string } = {
      1: 'Ficção Científica',
      2: 'Fantasia', 
      3: 'Suspense e Mistério',
      4: 'Romance',
      5: 'Literatura Clássica',
      6: 'Biografias e Memórias',
      7: 'História',
      8: 'Tecnologia e Ciência',
      9: 'Mangás e HQs',
      10: 'Autoajuda',
      11: 'Infantojuvenil',
      12: 'Gastronomia'
    };
    
    return genderMap[genderId] || 'Gênero desconhecido';
  }

  continueShopping() {
    this.router.navigate(['/books']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  printOrder() {
    window.print();
  }
}
