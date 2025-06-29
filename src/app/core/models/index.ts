// User Models - Baseado na estrutura real do backend
export interface User {
  id: number;
  username: string;
  password?: string; // Opcional no frontend por segurança
  role: 'ADMIN' | 'USER';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role?: 'USER'; // Por padrão será USER
}

// Gender Models - Baseado na tabela 'gender' do backend
export interface Gender {
  id: number;
  name: string;
  status_gender: 'INACTIVE' | 'ACTIVE';
}

// Book Models - Baseado na tabela 'books' do backend
export interface Book {
  id: number;
  name: string;
  price: number; // Preço em centavos (ex: 6990 = R$ 69.90)
  gender_id: number;
  status_stock: 'OUT_OF_STOCK' | 'IN_STOCK';
  // Propriedades calculadas/relacionadas (opcionais)
  gender?: Gender;
  priceFormatted?: string; // Ex: "R$ 69,90"
}

// Order Models - Baseado na tabela 'orders' do backend
export interface Order {
  id: number;
  user_id: number;
  // Propriedades relacionadas (opcionais)
  user?: User;
  items?: OrderItem[];
}

// OrderItem Models - Baseado na tabela 'items' do backend
export interface OrderItem {
  id: number;
  book_id: number;
  quantity: number;
  order_id: number;
  // Propriedades relacionadas (opcionais)
  book?: Book;
  totalPrice?: number; // quantity * book.price
}

// Purchase Models - Baseado na tabela 'purchases' do backend
export interface Purchase {
  id: number;
  user_id: number;
  order_id: number;
  created_at: string; // ISO string format
  total: number; // Total em centavos
  delivery_address: string;
  payment_method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';
  // Propriedades relacionadas (opcionais)
  user?: User;
  order?: Order;
  totalFormatted?: string; // Ex: "R$ 149,80"
}

// API Response Models
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Cart Models (Frontend only - para gerenciar carrinho localmente)
export interface CartItem {
  book: Book;
  quantity: number;
  subtotal: number; // quantity * book.price
}

export interface Cart {
  items: CartItem[];
  total: number;
  totalItems: number;
}

// Filter/Search Models
export interface BookFilters {
  search?: string;
  gender_id?: number;
  status_stock?: 'IN_STOCK' | 'OUT_OF_STOCK';
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'name' | 'price' | 'gender';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface GenderFilters {
  status_gender?: 'ACTIVE' | 'INACTIVE';
  search?: string;
}

// Checkout Models
export interface CheckoutData {
  delivery_address: string;
  payment_method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';
  items: {
    book_id: number;
    quantity: number;
  }[];
}

// Dashboard/Stats Models (para área admin)
export interface DashboardStats {
  totalUsers: number;
  totalBooks: number;
  totalOrders: number;
  totalRevenue: number;
  booksInStock: number;
  booksOutOfStock: number;
  activeGenders: number;
  recentPurchases: Purchase[];
}

// Error Models
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Constants baseados nos dados reais
export const AVAILABLE_GENDERS = [
  { id: 1, name: 'Ficção Científica', slug: 'ficcao-cientifica' },
  { id: 2, name: 'Fantasia', slug: 'fantasia' },
  { id: 3, name: 'Suspense e Mistério', slug: 'suspense-misterio' },
  { id: 4, name: 'Romance', slug: 'romance' },
  { id: 5, name: 'Literatura Clássica', slug: 'literatura-classica' },
  { id: 6, name: 'Biografias e Memórias', slug: 'biografias-memorias' },
  { id: 7, name: 'História', slug: 'historia' },
  { id: 8, name: 'Tecnologia e Ciência', slug: 'tecnologia-ciencia' },
  { id: 9, name: 'Mangás e HQs', slug: 'mangas-hqs' },
  { id: 10, name: 'Autoajuda', slug: 'autoajuda' },
  { id: 11, name: 'Infantojuvenil', slug: 'infantojuvenil' },
  { id: 12, name: 'Gastronomia', slug: 'gastronomia' }
] as const;

export const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'DEBIT_CARD', label: 'Cartão de Débito', icon: '💳' },
  { value: 'PIX', label: 'PIX', icon: '🔥' }
] as const;

export const STOCK_STATUS = [
  { value: 'IN_STOCK', label: 'Em Estoque', color: 'success' },
  { value: 'OUT_OF_STOCK', label: 'Esgotado', color: 'danger' }
] as const;

// Helper Types
export type PaymentMethodType = typeof PAYMENT_METHODS[number]['value'];
export type StockStatusType = typeof STOCK_STATUS[number]['value'];
export type UserRole = User['role'];
export type GenderStatus = Gender['status_gender'];

// Utility functions para formatação
export const formatPrice = (priceInCents: number): string => {
  const priceInReais = priceInCents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(priceInReais);
};

export const getGenderBySlug = (slug: string) => {
  return AVAILABLE_GENDERS.find(g => g.slug === slug);
};

export const getGenderById = (id: number) => {
  return AVAILABLE_GENDERS.find(g => g.id === id);
};
