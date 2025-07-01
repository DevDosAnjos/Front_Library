# É-Livro - E-commerce de Livros

Um sistema completo de e-commerce especializado em livros, desenvolvido com Angular 18 e Java Spring Boot.

## ✨ Funcionalidades Principais

### 🛒 Frontend (Angular 18)
- **Sistema de Autenticação**: Login/registro com controle de roles (Admin/User)
- **Catálogo de Livros**: Navegação, filtros por gênero, busca
- **Carrinho de Compras**: Adicionar/remover livros, persistência local
- **Checkout Simplificado**: Confirmação de compra com seleção de método de pagamento
- **Painel Administrativo**: Gestão completa de livros, usuários, gêneros e pedidos
- **Interface Responsiva**: Design moderno e mobile-friendly

### 🔧 Características Técnicas
- **Framework**: Angular 18 com Standalone Components
- **Arquitetura**: Modular com lazy loading
- **Estado**: Serviços reactive com RxJS
- **UI/UX**: Design system consistente e acessível
- **Build**: Otimizado para produção com SSR

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Serviços e utilitários core
│   │   │   ├── guards/              # Guards de autenticação e autorização
│   │   │   ├── services/            # Serviços (Auth, Cart, Book, etc.)
│   │   │   └── models/              # Interfaces e tipos TypeScript
│   │   ├── features/                # Módulos funcionais
│   │   │   ├── auth/                # Login/Registro
│   │   │   ├── home/                # Página inicial
│   │   │   ├── books/               # Catálogo de livros
│   │   │   ├── cart/                # Carrinho de compras
│   │   │   ├── checkout/            # Finalização de compra
│   │   │   └── admin/               # Painel administrativo
│   │   ├── layout/                  # Componentes de layout (Header, Footer)
│   │   └── shared/                  # Componentes reutilizáveis
│   └── assets/                      # Recursos estáticos
├── public/                          # Arquivos públicos
└── README.md                        # Este arquivo
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Angular CLI 18+

### Instalação
```bash
# Clone o repositório
git clone [repository-url]

# Acesse o diretório do frontend
cd frontend

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm start

# Ou execute em modo de produção
npm run build
npm run serve:ssr
```

### Desenvolvimento
```bash
# Servidor de desenvolvimento (http://localhost:4200)
npm start

# Build para produção
npm run build

# Testes unitários
npm test

# Linting
npm run lint
```

## 🔑 Credenciais de Acesso

### Usuário Administrador
- **Email**: admin@admin.com
- **Senha**: admin123

### Usuário Regular
- **Email**: user@user.com  
- **Senha**: user123

## 📋 Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- [x] Login/Logout com JWT
- [x] Registro de novos usuários
- [x] Controle de acesso por roles
- [x] Persistência de sessão
- [x] Guards de proteção de rotas

### ✅ Catálogo e Navegação
- [x] Listagem de livros com paginação
- [x] Filtros por gênero
- [x] Busca por título/autor
- [x] Visualização detalhada
- [x] Imagens padronizadas para todos os livros

### ✅ Carrinho de Compras
- [x] Adicionar/remover livros
- [x] Controle de quantidade
- [x] Cálculo automático de totais
- [x] Persistência local (localStorage)
- [x] Sincronização entre componentes

### ✅ Checkout Simplificado
- [x] Resumo do pedido
- [x] Seleção de método de pagamento (Cartão, PIX, Boleto)
- [x] Confirmação de compra
- [x] Integração com API ou simulação
- [x] Página de sucesso

### ✅ Painel Administrativo
- [x] Dashboard com estatísticas
- [x] Gestão de livros (CRUD completo)
- [x] Gestão de usuários
- [x] Gestão de gêneros
- [x] Gestão de pedidos
- [x] Interface consistente e intuitiva

### ✅ Experiência do Usuário
- [x] Design responsivo
- [x] Estados de loading
- [x] Tratamento de erros
- [x] Feedback visual
- [x] Navegação intuitiva

## 🎨 Padrões de Design

### Imagens de Livros
- **Imagem padrão**: `/assets/images/img-livros.jpg`
- **Fallback automático**: Todos os livros usam a mesma imagem padrão
- **Serviço centralizado**: `BookImageService` para lógica de imagens

### Componentes Admin
- **Padrão consistente**: Todos os dashboards seguem a mesma estrutura
- **Filtros padronizados**: Interface uniforme de busca e filtro
- **Tabelas responsivas**: Layout adaptável para diferentes telas
- **Modais reutilizáveis**: Componentes de CRUD padronizados

### Estados da Aplicação
- **Loading states**: Spinners e skeletons
- **Empty states**: Mensagens quando não há dados
- **Error states**: Tratamento elegante de erros
- **Success states**: Confirmações visuais

## 🔧 Configuração da API

A aplicação está configurada para se conectar com a API backend em:
- **URL**: `http://localhost:8080/api`
- **Timeout**: 10 segundos
- **Retry**: Automático em caso de falha
- **Fallback**: Dados mock quando API não disponível

## 📱 Responsividade

- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: Suporte a diferentes tamanhos de tela
- **Touch Friendly**: Elementos adequados para touch
- **Progressive Enhancement**: Funcionalidade básica garantida

## 🔒 Segurança

- **JWT Tokens**: Autenticação baseada em tokens
- **Route Guards**: Proteção de rotas sensíveis
- **Role-based Access**: Controle por perfil de usuário
- **XSS Protection**: Sanitização automática do Angular
- **CSRF Protection**: Headers de segurança configurados

## 🚀 Performance

- **Lazy Loading**: Módulos carregados sob demanda
- **Tree Shaking**: Código não utilizado removido automaticamente
- **OnPush Strategy**: Otimização de change detection
- **TrackBy Functions**: Otimização de listas grandes
- **Service Workers**: Cache e performance offline (configurável)

## 📈 Próximas Implementações

- [ ] Avaliações e comentários de livros
- [ ] Sistema de recomendações
- [ ] Wishlist/Lista de desejos
- [ ] Histórico de compras detalhado
- [ ] Notificações push
- [ ] Integração com gateways de pagamento reais
- [ ] Sistema de cupons e promoções
- [ ] Chat de suporte

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**É-Livro** - Transformando a experiência de compra de livros online 📚✨
