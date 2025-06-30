# Guia de Debug do Backend - Erro 403 Forbidden

## Situação Atual

O frontend Angular está funcionando corretamente e enviando as requisições para o backend, mas todas as tentativas de login retornam **403 Forbidden**. Isso indica que o problema está na configuração de segurança do backend Spring Boot.

## Evidências dos Logs

1. ✅ Frontend configurado corretamente:
   - AuthService funcionando
   - Requisições sendo enviadas para `http://localhost:8080/api/auth/login`
   - Headers corretos sendo enviados
   - Dados JSON válidos sendo enviados
   - **ATUALIZADO**: AuthService adaptado para aceitar apenas `{ token }` do backend

2. ❌ Backend rejeitando todas as requisições:
   - Status 403 em `/api/health`
   - Status 403 em `/api/auth/login`
   - Problemas de CORS em endpoints alternativos

## ✅ FRONTEND ATUALIZADO

O AuthService foi **adaptado** para aceitar diferentes formatos de resposta do backend:

### Formatos Suportados:
1. **Apenas token**: `{ "token": "eyJhbGc..." }` ← **SEU CASO**
2. **Access token**: `{ "access_token": "eyJhbGc..." }`
3. **API Response**: `{ "success": true, "data": { "token": "...", "user": {...} } }`
4. **Completo**: `{ "token": "...", "user": {...} }`

### Como Funciona:
- Se o backend retorna apenas `{ token }`, o frontend **cria automaticamente** o objeto `user` baseado no username fornecido
- Se o username for "admin" (case-insensitive), o role será "ADMIN", senão será "USER"
- O token é salvo no localStorage normalmente

## Possíveis Causas no Backend

### 1. Configuração de CORS
O backend pode não estar permitindo requisições de `http://localhost:4200`.

**Solução necessária no backend:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

### 2. Configuração de Endpoints Públicos
O endpoint `/api/auth/login` pode não estar marcado como público.

**Verificar no backend:**
- Controller deve ter `@RequestMapping("/api/auth")`
- Método login deve ter `@PostMapping("/login")`
- SecurityConfig deve permitir `/api/auth/**`

### 3. Problema com CSRF
O Spring Security pode estar exigindo token CSRF.

**Solução:**
```java
.csrf(csrf -> csrf.disable())
```

### 4. Configuração do Controller
Verificar se o controller está correto:

```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // Lógica de autenticação
        return ResponseEntity.ok(response);
    }
}
```

### 5. Problema com Health Check
O endpoint `/api/health` também retorna 403, indicando problema geral de segurança.

**Adicionar ao SecurityConfig:**
```java
.requestMatchers("/api/health", "/actuator/health").permitAll()
```

### 6. Configuração de Perfil de Desenvolvimento
Verificar se o backend está rodando no perfil correto:

```properties
# application-dev.properties
spring.profiles.active=dev
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web.cors=DEBUG
```

## Passos para Debug no Backend

### 1. Verificar se o Backend está Rodando
```bash
curl -X GET http://localhost:8080/api/health
```

### 2. Verificar Logs do Backend
Procurar por:
- Erros de CORS
- Mensagens de Spring Security
- Configurações de SecurityFilterChain

### 3. Habilitar Debug de Segurança
```properties
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG
```

### 4. Testar Endpoint Diretamente
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Admin","password":"Admin"}'
```

### 5. Verificar CORS com OPTIONS
```bash
curl -X OPTIONS http://localhost:8080/api/auth/login \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

## Configuração Completa Recomendada

### SecurityConfig.java
```java
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:4200", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated()
            )
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### application.yml
```yaml
spring:
  profiles:
    active: dev
  
server:
  port: 8080
  
logging:
  level:
    org.springframework.security: DEBUG
    org.springframework.web.cors: DEBUG
    com.seu.projeto: DEBUG
```

## Status Atual do Frontend

✅ **FRONTEND ESTÁ FUNCIONANDO CORRETAMENTE:**
- AuthService configurado
- Interceptors funcionando
- Requisições sendo enviadas corretamente
- Logs detalhados implementados
- Environment configurado para `http://localhost:8080/api`

❌ **PROBLEMA ESTÁ NO BACKEND:**
- Todas as requisições retornam 403
- CORS não configurado adequadamente
- Endpoints não marcados como públicos
- Spring Security bloqueando acesso

## Próximos Passos

1. **URGENTE**: Corrigir configuração de segurança do backend
2. Verificar se o backend está rodando na porta 8080
3. Implementar configuração CORS adequada
4. Marcar endpoints de autenticação como públicos
5. Habilitar logs de debug no backend
6. Testar endpoints diretamente com curl
7. Verificar hash das senhas no banco de dados

## Teste Final

Após corrigir o backend, estas requisições devem funcionar:
- `GET http://localhost:8080/api/health` → Status 200
- `POST http://localhost:8080/api/auth/login` → Status 200 ou 401 (se credenciais inválidas)
- Frontend deve conseguir fazer login com credenciais válidas
