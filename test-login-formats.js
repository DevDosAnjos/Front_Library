// Arquivo de teste para verificar diferentes formatos de resposta do backend
// Execute no console do navegador para testar

// Simular diferentes respostas do backend
const testResponses = {
  // Formato 1: Apenas token (como seu backend parece estar retornando)
  onlyToken: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  
  // Formato 2: access_token ao invés de token
  accessToken: {
    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  
  // Formato 3: Com wrapper ApiResponse
  apiResponse: {
    success: true,
    data: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      user: {
        id: 1,
        username: "Admin",
        role: "ADMIN"
      }
    }
  },
  
  // Formato 4: Direto token + user
  complete: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    user: {
      id: 1,
      username: "Admin", 
      role: "ADMIN"
    }
  }
};

// Função para testar o processamento de cada formato
function testLoginResponse(response, testName) {
  console.log(`\n=== TESTE: ${testName} ===`);
  console.log('Input response:', response);
  
  try {
    let token;
    let user;
    const credentials = { username: 'Admin', password: 'Admin' };
    
    // Reproduzir a lógica do AuthService
    if (response && response.token && typeof response.token === 'string') {
      console.log('✅ Detectado formato: apenas token');
      token = response.token;
      user = {
        id: credentials.username.toLowerCase() === 'admin' ? 1 : 2,
        username: credentials.username,
        role: credentials.username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER'
      };
      
    } else if (response && response.access_token && typeof response.access_token === 'string') {
      console.log('✅ Detectado formato: access_token');
      token = response.access_token;
      user = {
        id: credentials.username.toLowerCase() === 'admin' ? 1 : 2,
        username: credentials.username,
        role: credentials.username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER'
      };
      
    } else if (response && response.success && response.data && response.data.token) {
      console.log('✅ Detectado formato: ApiResponse');
      token = response.data.token;
      
      if (response.data.user) {
        user = response.data.user;
      } else {
        user = {
          id: credentials.username.toLowerCase() === 'admin' ? 1 : 2,
          username: credentials.username,
          role: credentials.username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER'
        };
      }
      
    } else if (response && response.token && response.user) {
      console.log('✅ Detectado formato: completo');
      token = response.token;
      user = response.user;
      
    } else {
      console.log('❌ Formato não reconhecido');
      throw new Error('Backend não retornou token válido');
    }
    
    console.log('Token extraído:', token);
    console.log('User final:', user);
    
    const loginData = {
      token: token,
      user: user
    };
    
    console.log('✅ LoginResponse final:', loginData);
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

// Executar testes
console.log('🧪 TESTANDO DIFERENTES FORMATOS DE RESPOSTA DO BACKEND');
testLoginResponse(testResponses.onlyToken, 'Apenas Token');
testLoginResponse(testResponses.accessToken, 'Access Token');
testLoginResponse(testResponses.apiResponse, 'API Response');
testLoginResponse(testResponses.complete, 'Completo');

console.log('\n🎯 RESULTADO:');
console.log('O AuthService agora deve aceitar qualquer um desses formatos!');
console.log('Se seu backend retorna apenas { token: "..." }, o frontend criará o user automaticamente.');
