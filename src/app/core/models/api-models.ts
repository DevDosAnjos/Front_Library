// ===== AUTHENTICATION & USER MODELS =====

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;  // ← Incluindo user no response
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  username: string;
}

export interface UserResponse {
  id: string;
  username: string;
  userRole: string;
  email?: string;
  fullName?: string;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

// User interface para uso interno do frontend
export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER';
  email?: string;
  fullName?: string;
  isActive?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
}

// Interfaces para operações CRUD de usuários
export interface UserCreateRequest {
  username: string;
  password: string;
  fullName: string;
  // Nota: role é opcional porque o registro público não aceita este campo
  // O usuário é criado como USER por padrão e pode ser alterado via edição
}

export interface UserUpdateRequest {
  username?: string;
  password?: string;
  userRole?: 'ADMIN' | 'USER';
}

// ===== BOOK MODELS =====

export interface BookCreateRequest {
  name: string;
  price: number;
  genderID: number;
  statusStock: 'OUT_OF_STOCK' | 'IN_STOCK';
}

export interface BookUpdateRequest {
  name: string;
  price: number;
  genderID: number;
  statusStock: 'OUT_OF_STOCK' | 'IN_STOCK';
}

export interface BookResponse {
  id: number;
  name: string;
  price: number;
  gender?: {
    id: number;
    name: string;
    status: string;
  } | null;
  genderID?: number;
  statusStock: 'OUT_OF_STOCK' | 'IN_STOCK';
}

// Book interface para uso interno do frontend
export interface Book {
  id: number;
  name: string;
  price: number;
  genderID: number;
  statusStock: 'OUT_OF_STOCK' | 'IN_STOCK';
  // Propriedades adicionais para display
  priceFormatted?: string;
  genderName?: string;
}

// Book interface estendida para admin com campos extras
export interface BookAdmin extends Book {
  author?: string;
  description?: string;
  stock?: number;
  imageUrl?: string;
  isbn?: string;
  publisher?: string;
  publishYear?: number;
  pages?: number;
  language?: string;
}

// ===== GENDER MODELS =====

export interface GenderCreateRequest {
  name: string;
  statusGender: 'INACTIVE' | 'ACTIVE';
}

export interface GenderUpdateRequest {
  name: string;
  statusGender: 'INACTIVE' | 'ACTIVE';
}

export interface GenderResponse {
  id: string;
  name: string;
  statusGender?: 'INACTIVE' | 'ACTIVE';
  status_gender?: 'INACTIVE' | 'ACTIVE'; // Backup para caso o backend use snake_case
}

// Gender interface para uso interno do frontend
export interface Gender {
  id: number;
  name: string;
  statusGender: 'INACTIVE' | 'ACTIVE';
}

// ===== ORDER MODELS =====

export interface OrderItemRequest {
  bookID: number;
  quantity: number;
}

export interface OrderRequest {
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  id: string;
  bookID: number;
  quantity: number;
  book?: BookResponse;
}

export interface OrderResponse {
  id: string;
  username: string;
  items: OrderItemResponse[];
  total?: number;
  createdAt?: string;
  status?: string;
  user?: {
    id: string;
    username: string;
    fullName?: string;
    email?: string;
  };
}

// Order interface para uso interno do frontend
export interface Order {
  id: number;
  username: string;
  items: OrderItem[];
  total?: number;
  createdAt?: string;
  status?: string;
  user?: {
    id: number;
    username: string;
    fullName?: string;
    email?: string;
  };
}

export interface OrderItem {
  id: number;
  bookID: number;
  quantity: number;
  book?: Book;
  // Propriedades para compatibilidade com template
  name: string;
  price: number;
  imageUrl: string;
}

// Interface extendida para o dashboard administrativo
export interface OrderAdmin extends Order {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  statusDisplay: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalFormatted: string;
  itemsCount: number;
  createdAtFormatted: string;
  status: string; // Override to make it non-optional
  // Propriedades para compatibilidade com template
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

// Interface para filtros de pedidos no dashboard
export interface OrderFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  username?: string;
}

// ===== PURCHASE MODELS =====

export interface PurchaseRequest {
  orderID: number;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BOLETO';
  deliveryAddress: string;
}

export interface PurchaseResponse {
  id: string;
  orderID: number;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BOLETO';
  deliveryAddress: string;
  status?: string;
  createdAt?: string;
}

// Purchase interface para uso interno do frontend
export interface Purchase {
  id: number;
  orderID: number;
  paymentMethod: string;
  deliveryAddress: string;
  status?: string;
  createdAt?: string;
}

// ===== FILTER MODELS =====

export interface BookFilters {
  search?: string;
  genderID?: number;
  statusStock?: 'ALL' | 'OUT_OF_STOCK' | 'IN_STOCK';
  price_min?: number;
  price_max?: number;
}

export interface GenderFilters {
  search?: string;
  statusGender?: 'INACTIVE' | 'ACTIVE';
}

export interface UserFilters {
  search?: string;
  userRole?: 'ADMIN' | 'USER';
  role?: 'ADMIN' | 'USER';  // Alias para userRole
  isActive?: boolean;
}

// ===== CART MODELS =====

export interface CartItem {
  book: BookAdmin;  // Mudando para BookAdmin que tem todas as propriedades
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: Date;
}

// ===== API RESPONSE WRAPPER =====

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
