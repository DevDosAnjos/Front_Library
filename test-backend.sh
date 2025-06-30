#!/bin/bash

# Script para testar o backend Spring Boot
# Execute este script para verificar se o backend está funcionando

echo "=== TESTE DO BACKEND SPRING BOOT ==="
echo ""

# Verificar se o backend está rodando
echo "1. Testando se o backend está rodando..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health
health_status=$?
if [ $health_status -eq 0 ]; then
    echo "✅ Backend está respondendo na porta 8080"
else
    echo "❌ Backend não está respondendo na porta 8080"
    echo "   Certifique-se de que o backend Spring Boot está rodando"
    exit 1
fi
echo ""

# Testar CORS preflight
echo "2. Testando CORS preflight..."
cors_response=$(curl -s -w "%{http_code}" -X OPTIONS http://localhost:8080/api/auth/login \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")
echo "Status CORS: $cors_response"
echo ""

# Testar endpoint de health
echo "3. Testando endpoint de health..."
health_response=$(curl -s -w "%{http_code}" http://localhost:8080/api/health)
echo "Health status: $health_response"
echo ""

# Testar login com credenciais
echo "4. Testando login..."
login_response=$(curl -s -w "%{http_code}" -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:4200" \
  -d '{"username":"Admin","password":"Admin"}')
echo "Login status: $login_response"
echo ""

# Testar endpoints alternativos
echo "5. Testando endpoints alternativos..."
echo "- /auth/login:"
curl -s -w "%{http_code}" -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Admin","password":"Admin"}'
echo ""

echo "- /login:"
curl -s -w "%{http_code}" -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Admin","password":"Admin"}'
echo ""

echo "- /api/login:"
curl -s -w "%{http_code}" -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Admin","password":"Admin"}'
echo ""

echo ""
echo "=== RESULTADOS ==="
echo "Se todos os testes retornaram 403, o problema está na configuração de segurança do backend."
echo "Se alguns retornaram 404, esses endpoints não existem."
echo "Se retornaram 200 ou 401, o backend está funcionando."
echo ""
echo "Para corrigir, verifique o arquivo BACKEND_DEBUGGING_GUIDE.md"
