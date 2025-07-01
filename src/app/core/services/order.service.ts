import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { 
  Order, 
  OrderAdmin,
  OrderRequest, 
  OrderResponse,
  OrderItem,
  OrderFilters 
} from '../models/api-models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private apiService: ApiService
  ) {}

  /**
   * Busca todos os pedidos para o dashboard administrativo (ADMIN apenas)
   * Alinhado com backend: GET /api/order/all (hasRole ADMIN conforme SecurityConfig)
   */
  getAllOrdersForAdmin(filters?: OrderFilters): Observable<OrderAdmin[]> {
    console.log('🔄 OrderService.getAllOrdersForAdmin() - Iniciando busca de pedidos para admin...');
    
    let params: any = {};
    if (filters) {
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.username) params.username = filters.username;
      console.log('📋 Filtros de pedidos aplicados:', params);
    }

    return this.apiService.get<OrderResponse[]>('order/all', params).pipe(
      map(orders => {
        console.log(`✅ OrderService: Recebidos ${orders.length} pedidos do backend`);
        const mappedOrders = orders.map(order => this.mapOrderResponseToOrderAdmin(order));
        console.log('📝 Pedidos mapeados para admin:', mappedOrders.slice(0, 2)); // Log apenas os 2 primeiros
        return mappedOrders;
      }),
      catchError((error: any) => {
        console.error('❌ OrderService.getAllOrdersForAdmin() - Erro na API:', error);
        console.error('🔍 Detalhes do erro:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        return of([]); // Retorna array vazio em caso de erro para não quebrar o dashboard
      })
    );
  }

  /**
   * Busca todos os pedidos (método original mantido para compatibilidade)
   * Alinhado com backend: GET /api/order/all (hasRole ADMIN conforme SecurityConfig)
   */
  getAllOrders(): Observable<Order[]> {
    console.log('🔄 OrderService.getAllOrders() - Iniciando busca de pedidos...');
    
    return this.apiService.get<OrderResponse[]>('order/all').pipe(
      map(orders => {
        console.log(`✅ OrderService: Recebidos ${orders.length} pedidos do backend`);
        const mappedOrders = orders.map(order => this.mapOrderResponseToOrder(order));
        console.log('📝 Pedidos mapeados:', mappedOrders.slice(0, 2)); // Log apenas os 2 primeiros
        return mappedOrders;
      }),
      catchError((error: any) => {
        console.error('❌ OrderService.getAllOrders() - Erro na API:', error);
        console.error('🔍 Detalhes do erro:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        return of([]); // Retorna array vazio em caso de erro para não quebrar o dashboard
      })
    );
  }

  /**
   * Busca pedidos do usuário autenticado
   * Alinhado com backend: GET /api/order/user (authenticated)
   */
  getUserOrders(): Observable<Order[]> {
    return this.apiService.get<OrderResponse[]>('order/user').pipe(
      map(orders => orders.map(order => this.mapOrderResponseToOrder(order))),
      catchError(() => of([])) // Retorna array vazio em caso de erro
    );
  }

  /**
   * Cria um novo pedido
   * Alinhado com backend: POST /api/order (authenticated)
   */
  createOrder(orderData: OrderRequest): Observable<Order> {
    return this.apiService.post<OrderResponse>('order', orderData).pipe(
      map(order => this.mapOrderResponseToOrder(order))
    );
  }

  /**
   * Busca estatísticas de pedidos (ADMIN apenas)
   */
  getOrderStats(): Observable<{totalOrders: number, completedOrders: number, pendingOrders: number}> {
    return this.apiService.get<any>('order/stats').pipe(
      map(stats => ({
        totalOrders: stats.totalOrders || 0,
        completedOrders: stats.completedOrders || 0,
        pendingOrders: stats.pendingOrders || 0
      })),
      catchError(() => of({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0
      }))
    );
  }

  /**
   * Mapeia OrderResponse do backend para OrderAdmin do frontend (dashboard)
   */
  private mapOrderResponseToOrderAdmin(orderResponse: OrderResponse): OrderAdmin {
    const baseOrder = this.mapOrderResponseToOrder(orderResponse);
    
    // Determinar nome e email do cliente
    const customerName = orderResponse.user?.fullName || orderResponse.user?.username || orderResponse.username || 'Cliente não identificado';
    const customerEmail = orderResponse.user?.email || `${orderResponse.username}@email.com`;
    
    // Mapear status para formato do dashboard
    const statusMapping: { [key: string]: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' } = {
      'PENDING': 'PENDING',
      'PROCESSING': 'PROCESSING', 
      'SHIPPED': 'SHIPPED',
      'DELIVERED': 'DELIVERED',
      'CANCELLED': 'CANCELLED'
    };
    
    const statusDisplay = statusMapping[orderResponse.status?.toUpperCase() || 'PENDING'] || 'PENDING';
    
    // Endereço de entrega padrão (pode ser expandido futuramente)
    const shippingAddress = {
      street: 'Rua não informada',
      number: 'S/N',
      complement: undefined,
      neighborhood: 'Bairro não informado',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '00000-000'
    };
    
    return {
      ...baseOrder,
      customerName,
      customerEmail,
      customerPhone: orderResponse.user?.username ? `(11) 9${orderResponse.user.username.slice(-4)}-${orderResponse.user.username.slice(-4)}` : undefined,
      statusDisplay,
      totalFormatted: this.formatPrice(baseOrder.total || 0),
      itemsCount: baseOrder.items.length,
      createdAtFormatted: this.formatDate(baseOrder.createdAt || new Date().toISOString()),
      shippingAddress,
      // Garantir que status não seja undefined
      status: orderResponse.status || 'PENDING'
    };
  }

  /**
   * Mapeia OrderResponse do backend para Order do frontend
   */
  private mapOrderResponseToOrder(orderResponse: OrderResponse): Order {
    return {
      id: typeof orderResponse.id === 'string' ? parseInt(orderResponse.id) : orderResponse.id,
      username: orderResponse.username,
      items: orderResponse.items?.map(item => this.mapOrderItemResponseToOrderItem(item)) || [],
      total: orderResponse.total || 0,
      createdAt: orderResponse.createdAt || new Date().toISOString(),
      status: orderResponse.status || 'PENDING',
      user: orderResponse.user ? {
        id: typeof orderResponse.user.id === 'string' ? parseInt(orderResponse.user.id) : parseInt(orderResponse.user.id || '0'),
        username: orderResponse.user.username,
        fullName: orderResponse.user.fullName,
        email: orderResponse.user.email
      } : undefined
    };
  }

  /**
   * Mapeia OrderItemResponse do backend para OrderItem do frontend
   */
  private mapOrderItemResponseToOrderItem(itemResponse: any): OrderItem {
    return {
      id: typeof itemResponse.id === 'string' ? parseInt(itemResponse.id) : itemResponse.id,
      bookID: itemResponse.bookID,
      quantity: itemResponse.quantity,
      // Propriedades obrigatórias para compatibilidade com template
      name: itemResponse.book?.name || `Livro ${itemResponse.bookID}`,
      price: itemResponse.book?.price || 0,
      imageUrl: itemResponse.book?.imageUrl || '/assets/images/book-placeholder.jpg',
      book: itemResponse.book ? {
        id: typeof itemResponse.book.id === 'string' ? parseInt(itemResponse.book.id) : itemResponse.book.id,
        name: itemResponse.book.name,
        price: itemResponse.book.price,
        genderID: itemResponse.book.genderID || itemResponse.book.gender?.id || 0,
        statusStock: itemResponse.book.statusStock
      } : undefined
    };
  }

  /**
   * Formata preço de centavos para string em reais
   */
  private formatPrice(priceInCents: number): string {
    const priceInReais = priceInCents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(priceInReais);
  }

  /**
   * Formata data ISO para formato brasileiro
   */
  private formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
