# É-Livro - Frontend E-commerce

## 📋 Estrutura Criada

Estrutura completa para o frontend do e-commerce de livros "É-Livro" usando Angular 19 com arquitetura modular e escalável.

## 🏗️ Arquitetura

### **📁 Pastas Principais**

```
src/app/
├── core/                   # Funcionalidades essenciais
│   ├── guards/             # Guards de autenticação e autorização
│   ├── interceptors/       # Interceptors HTTP
│   ├── models/            # Interfaces e tipos TypeScript
│   └── services/          # Serviços globais
├── shared/                # Componentes reutilizáveis
│   ├── components/        # Componentes compartilhados
│   ├── directives/        # Diretivas customizadas
│   └── pipes/             # Pipes customizados
├── layout/                # Componentes de layout
│   ├── header/            # Cabeçalho da aplicação
│   ├── footer/            # Rodapé da aplicação
│   └── sidebar/           # Menu lateral (se necessário)
└── features/              # Módulos de funcionalidades
    ├── home/              # Página inicial
    ├── auth/              # Autenticação
    ├── users/             # Gestão de usuários
    ├── books/             # Catálogo de livros
    ├── genres/            # Gêneros literários
    ├── cart/              # Carrinho de compras
    ├── orders/            # Histórico de pedidos
    ├── checkout/          # Finalização de compra
    └── admin/             # Área administrativa
```

### **🎯 Funcionalidades por Módulo**

#### **🔐 Auth (Autenticação)**
- Login/Logout
- Registro de usuário
- Recuperação de senha
- Gerenciamento de tokens

#### **👥 Users (Usuários)**
- Perfil do usuário
- Edição de dados pessoais
- Configurações da conta

#### **📖 Books (Livros)**
- Catálogo de livros
- Detalhes do livro
- Pesquisa e filtros
- Avaliações e comentários

#### **📚 Genres (Gêneros)**
- Listagem de gêneros
- Filtros por categoria
- Navegação por gênero

#### **🛒 Cart (Carrinho)**
- Adicionar/remover itens
- Alterar quantidades
- Cálculo de totais

#### **📦 Orders (Pedidos)**
- Histórico de compras
- Status dos pedidos
- Detalhes do pedido

#### **💳 Checkout (Finalização)**
- Dados de entrega
- Forma de pagamento
- Confirmação do pedido

#### **⚙️ Admin (Administração)**
- Dashboard administrativo
- Gestão de livros
- Gestão de usuários
- Relatórios

## 🔒 Sistema de Autenticação

### **Guards Implementados**
- **AuthGuard**: Protege rotas que requerem autenticação
- **AdminGuard**: Protege rotas administrativas

### **Níveis de Acesso**
1. **Público**: Home, catálogo, detalhes de livros
2. **Autenticado**: Perfil, carrinho, checkout, pedidos
3. **Admin**: Área administrativa completa

## 🎨 Tema e Design

### **Paleta de Cores**
- **Principal**: Verde (#00C851)
- **Secundária**: Preto (#000000)
- **Apoio**: Branco, cinzas variados

### **Design System**
- Inspirado em: Kabum, MercadoLivre, Amazon
- Componentes reutilizáveis
- Design responsivo
- Tipografia moderna (Inter)

## 🛠️ Arquivos Criados

### **Core**
- ✅ `api.service.ts` - Serviço base para API
- ✅ `auth.guard.ts` - Guard de autenticação
- ✅ `admin.guard.ts` - Guard de administração
- ✅ `auth.interceptor.ts` - Interceptor de autenticação
- ✅ `models/index.ts` - Interfaces TypeScript

### **Estilos**
- ✅ `theme.css` - Tema completo da aplicação
- ✅ `styles.css` - Estilos globais atualizados

### **Configuração**
- ✅ `environment.ts` - Configurações de desenvolvimento
- ✅ `environment.prod.ts` - Configurações de produção
- ✅ `app.routes.ts` - Roteamento principal

### **Estrutura de Rotas**
- ✅ Arquivos de rotas para todos os módulos
- ✅ Lazy loading configurado
- ✅ Guards aplicados conforme necessário

## 🚀 Próximos Passos

1. **Implementar Componentes Base**
   - Header com navegação e busca
   - Footer da aplicação
   - Componentes de loading

2. **Desenvolver Autenticação**
   - AuthService completo
   - Formulários de login/registro
   - Integração com backend

3. **Criar Catálogo de Livros**
   - Lista de livros com paginação
   - Cards de livros
   - Sistema de busca e filtros

4. **Implementar Carrinho**
   - Estado global do carrinho
   - Persistência local
   - Sincronização com backend

5. **Finalizar Checkout**
   - Formulários de pagamento
   - Integração com APIs de pagamento
   - Confirmação de pedidos

## 📝 Comandos para Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm start

# Build para produção
npm run build

# Executar testes
npm test
```

## 🔧 Dependências Recomendadas

```bash
# Angular Material (opcional)
ng add @angular/material

# PrimeNG (alternativa)
npm install primeng primeicons

# Reactive Forms
# (já incluído no Angular)

# HTTP Client
# (já incluído no Angular)
```

A estrutura está pronta para começar o desenvolvimento das funcionalidades específicas!
