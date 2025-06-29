# Estrutura do Frontend - É-Livro

## 📁 Organização das Pastas

### 🏗️ **core/**
Módulo central com serviços e funcionalidades essenciais que são usados em toda a aplicação.

- **services/**: Serviços globais (API, configuração, etc.)
- **guards/**: Guards de rota (auth guard, admin guard, etc.)
- **interceptors/**: Interceptors HTTP (auth token, error handling, etc.)
- **models/**: Interfaces e tipos TypeScript globais

### 🔄 **shared/**
Componentes, pipes e diretivas reutilizáveis em toda a aplicação.

- **components/**: Componentes reutilizáveis (botões, modais, cards, etc.)
- **pipes/**: Pipes customizados (formatação de preço, data, etc.)
- **directives/**: Diretivas customizadas

### 🎨 **layout/**
Componentes de layout da aplicação.

- **header/**: Cabeçalho com navegação e pesquisa
- **footer/**: Rodapé da aplicação
- **sidebar/**: Menu lateral (se necessário)

### 🚀 **features/**
Módulos específicos de cada funcionalidade do e-commerce.

#### 🔐 **auth/**
- Login, registro, recuperação de senha
- **components/**: Formulários de auth
- **pages/**: Páginas de login/registro
- **services/**: AuthService, TokenService

#### 👥 **users/**
- Perfil do usuário, configurações
- **components/**: Componentes de perfil
- **pages/**: Páginas de perfil e configurações
- **services/**: UserService

#### 📚 **genres/**
- Listagem e filtros por gênero
- **components/**: Cards de gênero, filtros
- **pages/**: Página de gêneros
- **services/**: GenreService

#### 📖 **books/**
- Catálogo, detalhes, pesquisa de livros
- **components/**: BookCard, BookDetail, BookSearch
- **pages/**: Catálogo, detalhes do livro
- **services/**: BookService

#### 🛒 **cart/**
- Carrinho de compras
- **components/**: CartItem, CartSummary
- **pages/**: Página do carrinho
- **services/**: CartService

#### 📦 **orders/**
- Histórico de pedidos
- **components/**: OrderItem, OrderDetails
- **pages/**: Lista e detalhes de pedidos
- **services/**: OrderService

#### 💳 **checkout/**
- Processo de finalização da compra
- **components/**: PaymentForm, AddressForm
- **pages/**: Páginas do checkout
- **services/**: CheckoutService

#### ⚙️ **admin/**
- Área administrativa (somente para admins)
- **components/**: Tabelas, formulários admin
- **pages/**: Dashboard, gestão de livros/usuários
- **services/**: AdminService

#### 🏠 **home/**
- Página inicial
- **components/**: Banner, FeaturedBooks, Categories
- **pages/**: HomePage

## 🎯 Fluxo de Rotas

### Rotas Públicas (sem autenticação)
- `/` - Home
- `/books` - Catálogo de livros
- `/books/:id` - Detalhes do livro
- `/genres` - Gêneros
- `/login` - Login
- `/register` - Registro

### Rotas Privadas (com autenticação)
- `/profile` - Perfil do usuário
- `/cart` - Carrinho
- `/checkout` - Finalizar compra
- `/orders` - Histórico de pedidos

### Rotas Admin (admin apenas)
- `/admin/dashboard` - Dashboard admin
- `/admin/books` - Gestão de livros
- `/admin/users` - Gestão de usuários
- `/admin/orders` - Gestão de pedidos

## 🎨 Tema - É-Livro
- **Cores principais**: Preto (#000000) e Verde (#00FF00 ou variações)
- **Inspiração**: Layout moderno similar ao Kabum, MercadoLivre, Amazon
- **Responsivo**: Mobile-first design

## 🔧 Próximos Passos
1. Configurar variáveis de ambiente
2. Criar modelos de dados (interfaces)
3. Implementar serviços de API
4. Criar guards de autenticação
5. Desenvolver componentes base
6. Implementar roteamento
7. Criar tema e estilos globais
