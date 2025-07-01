import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { AuthService } from '../../../../core/services/auth.service';
import { OrderService } from '../../../../core/services/order.service';
import { OrderAdmin, OrderFilters } from '../../../../core/models/api-models';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './orders-management.component.html',
  styleUrl: './orders-management.component.css'
})
export class OrdersManagementComponent implements OnInit {
  orders: OrderAdmin[] = [];
  filteredOrders: OrderAdmin[] = [];
  selectedOrder: OrderAdmin | null = null;
  
  isLoading = true;
  loadError = false;
  
  searchTerm = '';
  selectedStatus = '';
  dateFrom = '';
  dateTo = '';
  
  // Propriedades para ordenação e paginação
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';
  pagination = {
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  };

  constructor(
    private router: Router,
    private storageService: StorageService,
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.checkAdminAuth();
    this.loadOrders();
  }

  checkAdminAuth() {
    // Verificar através do AuthService
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      // Não é admin - redirecionar para login
      this.router.navigate(['/auth/login'], {
        queryParams: { message: 'Acesso restrito a administradores.' }
      });
      return;
    }
  }

  loadOrders() {
    this.isLoading = true;
    this.loadError = false;
    
    console.log('🔄 Carregando pedidos do banco de dados...');
    
    // Criar filtros baseados nos campos de busca
    const filters: OrderFilters = {};
    if (this.searchTerm) filters.search = this.searchTerm;
    if (this.selectedStatus) filters.status = this.selectedStatus;
    if (this.dateFrom) filters.dateFrom = this.dateFrom;
    if (this.dateTo) filters.dateTo = this.dateTo;

    this.orderService.getAllOrdersForAdmin(filters).subscribe({
      next: (orders) => {
        console.log(`✅ Pedidos carregados com sucesso: ${orders.length} encontrados`);
        this.orders = orders;
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar pedidos:', error);
        this.loadError = true;
        this.isLoading = false;
        
        // Fallback: dados mockados para desenvolvimento/teste
        console.log('🔄 Carregando dados de fallback...');
        this.loadMockOrders();
      }
    });
  }

  /**
   * Carrega dados de fallback em caso de erro na API
   */
  private loadMockOrders() {
    // Dados simulados apenas para fallback quando a API não está disponível
    this.orders = [
      {
        id: 1001,
        username: 'joao_silva',
        customerName: 'João Silva',
        customerEmail: 'joao.silva@email.com',
        customerPhone: '(11) 99999-9999',
        statusDisplay: 'PENDING',
        totalFormatted: 'R$ 89,00',
        itemsCount: 2,
        createdAtFormatted: '15/01/2024 10:30',
        total: 8900,
        createdAt: '2024-01-15T10:30:00Z',
        status: 'PENDING',
        items: [
          {
            id: 1,
            bookID: 101,
            quantity: 2,
            name: 'Livro de Exemplo 1',
            price: 3500,
            imageUrl: '/assets/images/book-placeholder.jpg'
          },
          {
            id: 2,
            bookID: 102,
            quantity: 1,
            name: 'Livro de Exemplo 2',
            price: 1900,
            imageUrl: '/assets/images/book-placeholder.jpg'
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
        },
        user: {
          id: 1,
          username: 'joao_silva',
          fullName: 'João Silva',
          email: 'joao.silva@email.com'
        }
      },
      {
        id: 1002,
        username: 'maria_santos',
        customerName: 'Maria Santos',
        customerEmail: 'maria.santos@email.com',
        customerPhone: '(11) 88888-8888',
        statusDisplay: 'PROCESSING',
        totalFormatted: 'R$ 45,00',
        itemsCount: 1,
        createdAtFormatted: '14/01/2024 15:45',
        total: 4500,
        createdAt: '2024-01-14T15:45:00Z',
        status: 'PROCESSING',
        items: [
          {
            id: 3,
            bookID: 103,
            quantity: 1,
            name: 'Livro de Exemplo 3',
            price: 4500,
            imageUrl: '/assets/images/book-placeholder.jpg'
          }
        ],
        shippingAddress: {
          street: 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100'
        },
        user: {
          id: 2,
          username: 'maria_santos',
          fullName: 'Maria Santos',
          email: 'maria.santos@email.com'
        }
      }
    ];
    
    this.applyFiltersAndSort();
  }

  /**
   * Aplica filtros e ordenação nos pedidos
   */
  applyFiltersAndSort() {
    let filtered = [...this.orders];
    
    // Filtro por texto
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term) ||
        order.username.toLowerCase().includes(term)
      );
    }
    
    // Filtro por status
    if (this.selectedStatus) {
      filtered = filtered.filter(order => order.statusDisplay === this.selectedStatus);
    }
    
    // Filtro por data
    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(order => new Date(order.createdAt || '') >= fromDate);
    }
    
    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      toDate.setHours(23, 59, 59, 999); // Incluir todo o dia
      filtered = filtered.filter(order => new Date(order.createdAt || '') <= toDate);
    }
    
    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt || '');
          bValue = new Date(b.createdAt || '');
          break;
        case 'total':
          aValue = a.total || 0;
          bValue = b.total || 0;
          break;
        case 'customer':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'status':
          aValue = a.statusDisplay;
          bValue = b.statusDisplay;
          break;
        default:
          aValue = new Date(a.createdAt || '');
          bValue = new Date(b.createdAt || '');
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
    this.applyFiltersAndSort();
  }

  onStatusFilter() {
    this.pagination.page = 1;
    this.applyFiltersAndSort();
  }

  onDateFilter() {
    this.pagination.page = 1;
    this.applyFiltersAndSort();
  }

  onSort() {
    this.applyFiltersAndSort();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pagination.page = page;
      this.applyFiltersAndSort();
    }
  }

  updateOrderStatus(order: OrderAdmin, event: any) {
    const newStatus = event.target.value;
    const index = this.orders.findIndex(o => o.id === order.id);
    if (index >= 0) {
      this.orders[index].statusDisplay = newStatus;
      this.orders[index].status = newStatus;
      this.applyFiltersAndSort();
      
      // TODO: Implementar atualização no backend via API
      console.log(`Status do pedido ${order.id} atualizado para ${newStatus}`);
    }
  }

  viewOrder(order: OrderAdmin) {
    this.selectedOrder = order;
  }

  closeOrderDetails() {
    this.selectedOrder = null;
  }

  printOrder(order: OrderAdmin) {
    // Implementar funcionalidade de impressão
    window.print();
  }

  refreshOrders() {
    this.loadOrders();
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

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      PENDING: 'status-pending',
      PROCESSING: 'status-processing',
      SHIPPED: 'status-shipped',
      DELIVERED: 'status-delivered',
      CANCELLED: 'status-cancelled'
    };
    return classes[status] || 'status-pending';
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

  // Métodos para compatibilidade com template (caso ainda sejam necessários)
  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
