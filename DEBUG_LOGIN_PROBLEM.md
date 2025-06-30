# 🔧 Debug do Problema de Login Após Logout

## 🚨 **Problema Reportado:**
```
SimpleAuthService não está disponível ou método loginMock não existe
```

## 🔍 **Logs de Debug Adicionados:**

Para ajudar a diagnosticar o problema, foram adicionados logs detalhados:

### **Constructor do LoginComponent:**
```
LoginComponent: Construtor chamado
LoginComponent: SimpleAuthService injetado? true/false
LoginComponent: SimpleAuthService methods: [lista de métodos]
```

### **Lifecycle Hooks:**
```
LoginComponent ngOnInit: authService disponível? true/false
LoginComponent ngOnInit: loginMock method exists? true/false
LoginComponent ngAfterViewInit: authService disponível? true/false
LoginComponent ngAfterViewInit: loginMock method exists? true/false
```

### **Durante onSubmit:**
```
onSubmit: Início do método
onSubmit: authService disponível? true/false
Tentando chamar loginMock...
```

## 🧪 **Passos para Diagnóstico:**

### **Teste 1: Login Inicial**
1. Abra as DevTools (F12) → Console
2. Faça login como `usuario`/`123456`
3. Observe os logs do constructor e lifecycle hooks
4. Verifique se o SimpleAuthService está sendo injetado corretamente

### **Teste 2: Logout**
1. Faça logout no header
2. Observe o log: `Header: Executando logout`
3. Verifique se o `SimpleAuthService.logout` é chamado

### **Teste 3: Segundo Login (Admin)**
1. Tente fazer login como `admin`/`admin123`
2. **Observe cuidadosamente os logs:**
   - Constructor é chamado novamente?
   - SimpleAuthService está disponível?
   - Método loginMock existe?

## 🔄 **Cenários Possíveis:**

### **Cenário A: Serviço não é injetado na segunda vez**
```
LoginComponent: SimpleAuthService injetado? false
```
**Solução:** Problema de injeção de dependências

### **Cenário B: Serviço existe mas método não**
```
LoginComponent: SimpleAuthService injetado? true
loginMock method exists? false
```
**Solução:** Problema de definição do método ou prototype

### **Cenário C: Component não é recriado**
```
Constructor só é chamado uma vez
```
**Solução:** Component não está sendo destruído/recriado

## 📋 **Informações para Coleta:**

Por favor, forneça os seguintes logs quando testar:

1. **Logs completos do console** durante:
   - Login inicial como usuário comum
   - Logout
   - Tentativa de login como admin

2. **Network tab:** Verificar se há requests falhando

3. **Application tab → Local Storage:** Verificar se dados estão sendo limpos no logout

## 🛠️ **Possíveis Soluções:**

### **Solução Temporária:**
Recarregar a página após logout:
```typescript
logout() {
  this.authService.logout();
  window.location.href = '/';
}
```

### **Solução Definitiva:**
Dependendo dos logs, pode ser necessário:
- Revisar injeção de dependências
- Verificar lifecycle do component
- Investigar problem com Angular Router

---

**🔍 Execute os testes e compartilhe os logs completos do console para identificarmos a causa exata!**
