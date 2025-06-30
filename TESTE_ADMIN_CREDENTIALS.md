# 🔐 Guia de Teste - Sistema de Autenticação e Autorização Admin

## Credenciais para Teste

### 👤 **Usuário Comum (SEM privilégios de admin):**
```
Username: usuario
Password: 123456
```

### 👨‍💼 **Usuário Administrador (COM privilégios de admin):**
```
Username: admin
Password: admin123
```

## 🧪 Cenários de Teste

### **Teste 1: Login como Usuário Comum**
1. Acesse a página de login: `/auth/login`
2. Digite as credenciais do usuário comum:
   - Username: `usuario`
   - Password: `123456`
3. Clique em "Entrar"

**Resultado Esperado:**
- ✅ Login realizado com sucesso
- ✅ Redirecionamento para a página inicial (`/`)
- ✅ Header mostra o nome "usuario" no menu do usuário
- ❌ **Link "Admin" NÃO aparece no header**
- ❌ Se tentar acessar `/admin` diretamente, será redirecionado para login

### **Teste 2: Login como Administrador**
1. Se estiver logado, faça logout primeiro
2. Acesse a página de login: `/auth/login`
3. Digite as credenciais do administrador:
   - Username: `admin`
   - Password: `admin123`
4. Clique em "Entrar"

**Resultado Esperado:**
- ✅ Login realizado com sucesso
- ✅ Redirecionamento para o dashboard admin (`/admin`)
- ✅ Header mostra o nome "admin" no menu do usuário
- ✅ **Link "Admin" aparece no header** (com ícone de engrenagem)
- ✅ Pode acessar todas as páginas administrativas

### **Teste 3: Proteção de Rotas**
1. Estando logado como usuário comum (`usuario`)
2. Tente acessar diretamente: `http://localhost:4200/admin`

**Resultado Esperado:**
- ❌ Acesso negado
- ✅ Redirecionamento para `/auth/login`
- ✅ Mensagem: "Acesso restrito a administradores."

### **Teste 4: Mudança de Contexto**
1. Faça login como `usuario` (comum)
2. Observe que o link "Admin" não aparece
3. Faça logout
4. Faça login como `admin`
5. Observe que o link "Admin" aparece imediatamente

**Resultado Esperado:**
- ✅ Header atualiza automaticamente sem refresh da página
- ✅ Link "Admin" aparece/desaparece conforme o tipo de usuário

## 🔍 Logs de Debug

Abra o Console do Developer Tools (F12) para ver os logs:

```
Header: Estado de autenticação atualizado { isLoggedIn: true, userName: 'usuario', isAdmin: false }
Header: Estado de autenticação atualizado { isLoggedIn: true, userName: 'admin', isAdmin: true }
```

## 🛡️ Como Funciona a Verificação

```typescript
// No HTML do header:
*ngIf="isLoggedIn && isAdmin()"

// No AuthService:
isAdmin(): boolean {
  const currentUser = this.currentUserSubject.value;
  return currentUser?.role === 'ADMIN';
}

// Lógica de determinação de role no login:
const role = (username === 'admin' && password === 'admin123') ? 'ADMIN' : 'USER';
```

## 📱 Teste em Mobile

O sistema também funciona no menu mobile - o link admin aparece na versão mobile apenas para administradores.

## ⚡ Reatividade

O sistema usa `BehaviorSubject` do RxJS para reatividade automática:
- Mudanças de estado são propagadas imediatamente
- Header atualiza sem necessidade de refresh
- Guards de rota reagem em tempo real

---

**💡 Dica:** Use as credenciais exatas como mostrado acima para garantir o funcionamento correto do sistema.
