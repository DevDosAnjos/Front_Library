import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';

// Interfaces para os tipos de dados
interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  created_at: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './orders-management.component.html',
  styleUrl: './orders-management.component.css'
})
export class OrdersManagementComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  
  isLoading = true;
  
  searchTerm = '';
  selectedStatus = '';
  dateFrom = '';
  dateTo = '';
  
  // Propriedades para ordenação e paginação
  sortBy = 'created_at';
  sortOrder: 'asc' | 'desc' = 'desc';
  pagination = {
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  };

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.checkAdminAuth();
    this.loadOrders();
  }

  checkAdminAuth() {
    const token = this.storageService.getItem('authToken');
    const userRole = this.storageService.getItem('userRole');
    
    if (!token || userRole !== 'ADMIN') {
      this.router.navigate(['/auth/login'], {
        queryParams: { message: 'Acesso restrito a administradores.' }
      });
      return;
    }
  }

  loadOrders() {
    this.isLoading = true;
    
    // Simulando dados de pedidos - em um ambiente real, isso viria de um serviço
    setTimeout(() => {
      this.orders = [
        {
          id: 1001,
          customerName: 'João Silva',
          customerEmail: 'joao.silva@email.com',
          customerPhone: '(11) 99999-9999',
          status: 'PENDING',
          total: 8900, // R$ 89,00 em centavos
          created_at: '2024-01-15T10:30:00Z',
          items: [
            {
              id: 1,
              name: 'Dom Casmurro',
              price: 2500,
              quantity: 1,
              imageUrl: '/assets/images/dom-casmurro.jpg'
            },
            {
              id: 2,
              name: 'O Cortiço',
              price: 3200,
              quantity: 2,
              imageUrl: '/assets/images/o-cortico.jpg'
            }
          ],
          shippingAddress: {
            street: 'Rua das Flores',
            number: '123',
            complement: 'Apto 45',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567'
          }
        },
        {
          id: 1002,
          customerName: 'Maria Santos',
          customerEmail: 'maria.santos@email.com',
          customerPhone: '(11) 88888-8888',
          status: 'PROCESSING',
          total: 4500, // R$ 45,00 em centavos
          created_at: '2024-01-14T15:45:00Z',
          items: [
            {
              id: 3,
              name: 'Harry Potter e a Pedra Filosofal',
              price: 4500,
              quantity: 1,
              imageUrl: '/assets/images/harry-potter.jpg'
            }
          ],
          shippingAddress: {
            street: 'Avenida Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100'
          }
        },
        {
          id: 1003,
          customerName: 'Pedro Oliveira',
          customerEmail: 'pedro.oliveira@email.com',
          status: 'DELIVERED',
          total: 7800, // R$ 78,00 em centavos
          created_at: '2024-01-12T09:15:00Z',
          items: [
            {
              id: 4,
              name: '1984',
              price: 3900,
              quantity: 2,
              imageUrl: '/assets/images/1984.jpg'
            }
          ],
          shippingAddress: {
            street: 'Rua Augusta',
            number: '456',
            neighborhood: 'Consolação',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01305-000'
          }
        },
        {
          id: 1004,
          customerName: 'Ana Costa',
          customerEmail: 'ana.costa@email.com',
          customerPhone: '(11) 77777-7777',
          status: 'SHIPPED',
          total: 5600, // R$ 56,00 em centavos
          created_at: '2024-01-13T14:20:00Z',
          items: [
            {
              id: 5,
              name: 'Pride and Prejudice',
              price: 2800,
              quantity: 2,
              imageUrl: '/assets/images/pride-prejudice.jpg'
            }
          ],
          shippingAddress: {
            street: 'Rua Oscar Freire',
            number: '789',
            neighborhood: 'Jardins',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01426-001'
          }
        },
        {
          id: 1005,
          customerName: 'Carlos Mendes',
          customerEmail: 'carlos.mendes@email.com',
          status: 'CANCELLED',
          total: 3200, // R$ 32,00 em centavos
          created_at: '2024-01-11T11:30:00Z',
          items: [
            {
              id: 6,
              name: 'O Pequeno Príncipe',
              price: 3200,
              quantity: 1,
              imageUrl: '/assets/images/pequeno-principe.jpg'
            }
          ],
          shippingAddress: {
            street: 'Rua da Consolação',
            number: '321',
            neighborhood: 'Consolação',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01302-907'
          }
        }
      ];
      
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  applyFilters() {
    let filtered = [...this.orders];
    
    // Filtro por texto
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term)
      );
    }
    
    // Filtro por status
    if (this.selectedStatus) {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }
    
    // Filtro por data
    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(order => new Date(order.created_at) >= fromDate);
    }
    
    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      toDate.setHours(23, 59, 59, 999); // Incluir todo o dia
      filtered = filtered.filter(order => new Date(order.created_at) <= toDate);
    }
    
    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'customer':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }
      
      if (this.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    // Paginação
    this.pagination.totalItems = filtered.length;
    this.pagination.totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
    
    const startIndex = (this.pagination.page - 1) * this.pagination.itemsPerPage;
    const endIndex = startIndex + this.pagination.itemsPerPage;
    
    this.filteredOrders = filtered.slice(startIndex, endIndex);
  }

  onSearch() {
    this.pagination.page = 1;
    this.applyFilters();
  }

  onStatusFilter() {
    this.pagination.page = 1;
    this.applyFilters();
  }

  onDateFilter() {
    this.pagination.page = 1;
    this.applyFilters();
  }

  onSort() {
    this.applyFilters();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pagination.page = page;
      this.applyFilters();
    }
  }

  updateOrderStatus(order: Order, event: any) {
    const newStatus = event.target.value;
    const index = this.orders.findIndex(o => o.id === order.id);
    if (index >= 0) {
      this.orders[index].status = newStatus;
      this.applyFilters();
      
      // Simular atualização no backend
      console.log(`Status do pedido ${order.id} atualizado para ${newStatus}`);
    }
  }

  viewOrder(order: Order) {
    this.selectedOrder = order;
  }

  closeOrderDetails() {
    this.selectedOrder = null;
  }

  printOrder(order: Order) {
    // Implementar funcionalidade de impressão
    window.print();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      PENDING: 'Pendente',
      PROCESSING: 'Processando',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregue',
      CANCELLED: 'Cancelado'
    };
    return labels[status] || status;
  }

  // Métodos para estatísticas
  getTotalOrders(): number {
    return this.orders.length;
  }

  getPendingOrders(): number {
    return this.orders.filter(order => order.status === 'PENDING').length;
  }

  getProcessingOrders(): number {
    return this.orders.filter(order => order.status === 'PROCESSING').length;
  }

  getDeliveredOrders(): number {
    return this.orders.filter(order => order.status === 'DELIVERED').length;
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
