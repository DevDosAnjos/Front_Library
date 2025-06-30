# 📚 É-Livro - Sistema de Livraria Online

## 📋 Descrição do Projeto

Sistema completo de livraria online com dashboard administrativo desenvolvido em Angular 18 com integração para backend Spring Boot.

## ⚙️ Tecnologias Utilizadas

- **Frontend**: Angular 18, TypeScript, Angular Material
- **Styling**: CSS3, Angular Material Design
- **Autenticação**: JWT Token-based
- **Roteamento**: Angular Router com Guards
- **HTTP**: Angular HttpClient com Interceptors
- **Estado**: RxJS Observables

## 🏗️ Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Serviços centrais e utilitários
│   │   │   ├── guards/             # Guards de autenticação e autorização
│   │   │   ├── interceptors/       # HTTP Interceptors
│   │   │   ├── models/             # Modelos de dados
│   │   │   └── services/           # Serviços da aplicação
│   │   ├── features/               # Módulos funcionais
│   │   │   ├── admin/              # Dashboard administrativo
│   │   │   ├── auth/               # Autenticação
│   │   │   ├── books/              # Catálogo de livros
│   │   │   ├── cart/               # Carrinho de compras
│   │   │   ├── checkout/           # Finalização de compra
│   │   │   └── home/               # Página inicial
│   │   └── shared/                 # Componentes compartilhados
│   │       ├── components/         # Header, Footer, etc.
│   │       └── layout/             # Layout da aplicação
│   └── environments/               # Configurações de ambiente
```

## 🚀 Funcionalidades Implementadas

### 👤 Autenticação
- ✅ Login com username/password
- ✅ Sistema de JWT tokens
- ✅ Guards de proteção de rotas
- ✅ Interceptors para autenticação automática
- ✅ Fallback para modo mock quando backend indisponível

### 📚 Catálogo de Livros
- ✅ Listagem de livros com paginação
- ✅ Filtros por gênero
- ✅ Busca por título/autor
- ✅ Visualização detalhada de livros

### 🛒 Sistema de Compras
- ✅ Carrinho de compras
- ✅ Adição/remoção de itens
- ✅ Cálculo de totais
- ✅ Processo de checkout

### 👨‍💼 Dashboard Administrativo
- ✅ Gestão de livros (CRUD completo)
- ✅ Gestão de gêneros
- ✅ Interface responsiva
- ✅ Proteção por roles (ADMIN)

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- Angular CLI 18+
- Backend Spring Boot rodando na porta 8080

### Instalação
```bash
# Clone o repositório
git clone [url-do-repositorio]

# Instale as dependências
npm install

# Execute em modo desenvolvimento
ng serve

# Build para produção
ng build --prod
```

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário

### Livros
- `GET /api/books` - Listar livros
- `POST /api/books` - Criar livro (Admin)
- `PUT /api/books/{id}` - Atualizar livro (Admin)
- `DELETE /api/books/{id}` - Deletar livro (Admin)

### Gêneros
- `GET /api/genders` - Listar gêneros
- `POST /api/genders` - Criar gênero (Admin)
- `PUT /api/genders/{id}` - Atualizar gênero (Admin)
- `DELETE /api/genders/{id}` - Deletar gênero (Admin)

## 🔐 Sistema de Autenticação

### Credenciais de Teste
- **Admin**: `Admin` / `Admin`
- **User**: `user` / `password`

### Fluxo de Autenticação
1. Login via formulário
2. Recebimento de JWT token
3. Armazenamento seguro no localStorage
4. Inclusão automática do token em requests via interceptor
5. Validação de roles para acesso a áreas restritas

## 🛡️ Segurança

- Guards de autenticação em rotas protegidas
- Interceptors para tratamento de erros HTTP
- Validação de roles no frontend
- Proteção contra acesso não autorizado

## 📱 Responsividade

- Layout totalmente responsivo
- Compatível com desktop, tablet e mobile
- Design Material Design

## 🧪 Testes

### Modo Mock
O sistema possui um modo mock que permite desenvolvimento e testes sem backend:
- Dados simulados para todos os endpoints
- Autenticação simulada
- CRUD funcional com dados em memória

### Ativação do Modo Mock
No arquivo `environment.ts`:
```typescript
export const environment = {
  enableMockFallback: true
};
```

## 🔧 Configuração do Backend Spring Boot

Para integração completa, o backend Spring Boot deve ter a seguinte configuração:

### SecurityConfiguration.java
```java
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/books/**").permitAll()
                .requestMatchers("/api/genders/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .build();
    }
}
```

## 📞 Suporte e Troubleshooting

### Problemas Comuns

1. **Erro 403 no Login**
   - Verificar configuração Spring Security
   - Confirmar que CSRF está desabilitado
   - Validar endpoints permitidos

2. **CORS Errors**
   - Configurar CorsConfigurationSource no backend
   - Permitir origem do Angular (localhost:4200)

3. **Token Inválido**
   - Verificar se o token está sendo enviado nos headers
   - Validar formato JWT no backend

## 🎯 Próximas Funcionalidades

- [ ] Sistema de pedidos
- [ ] Histórico de compras
- [ ] Avaliações de livros
- [ ] Sistema de favoritos
- [ ] Notificações push

## 🚀 Comandos Angular CLI

### Development server
```bash
ng serve                    # Inicia servidor de desenvolvimento
```

### Code scaffolding
```bash
ng generate component component-name
ng generate service service-name
ng generate guard guard-name
```

### Building
```bash
ng build                    # Development build
ng build --configuration production  # Production build
```

### Testing
```bash
ng test                     # Unit tests
ng e2e                      # End-to-end tests
```

## 📁 Estrutura Final Limpa

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.component.*         # Componente raiz
│   │   ├── app.config.ts           # Configuração da aplicação
│   │   ├── app.routes.ts           # Rotas principais
│   │   ├── core/                   # Funcionalidades centrais
│   │   │   ├── services/           # 8 serviços essenciais
│   │   │   ├── guards/             # Guards de autenticação
│   │   │   ├── interceptors/       # HTTP Interceptors
│   │   │   └── models/             # Modelos de dados
│   │   ├── features/               # Módulos de funcionalidades
│   │   └── shared/                 # Componentes compartilhados
│   ├── environments/               # Configurações mínimas
│   │   ├── environment.ts          # Development
│   │   └── environment.prod.ts     # Production
│   ├── index.html                  # Arquivo HTML principal
│   ├── main.ts                     # Bootstrap da aplicação
│   └── styles.css                  # Estilos globais
├── README.md                       # Esta documentação
├── angular.json                    # Configuração Angular
├── package.json                    # Dependências NPM
└── tsconfig.json                   # Configuração TypeScript
```

## ⚙️ Configurações Simplificadas

### Environment (Development)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### Environment (Production)  
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

## 🧹 Limpeza Realizada

- ❌ Removidos 40+ arquivos de documentação desnecessários
- ❌ Configurações complexas do environment simplificadas  
- ❌ Lógica de mock/fallback removida do código
- ❌ Métodos de debug e desenvolvimento temporários removidos
- ❌ Serviços de backup e versões temporárias eliminados
- ✅ Mantido apenas código essencial e funcional
```

---

**Versão**: 1.0.0  
**Status**: Produção - Projeto Limpo e Otimizado  
**Última Atualização**: Junho 2025

**Projeto**: É-Livro - Sistema de Livraria Online  
**Tecnologia**: Angular 18 + Spring Boot Integration  
**Estado**: 🧹 Extremamente Limpo - Apenas Código Essencial
