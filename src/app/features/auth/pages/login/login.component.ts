import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { StorageService } from '../../../../core/services/storage.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfigService } from '../../../../core/services/config.service';
import { LoginRequest } from '../../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  loginMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService,
    private configService: ConfigService
  ) {
    console.log('LoginComponent: Construtor chamado');
    console.log('LoginComponent: AuthService injetado?', !!this.authService);
    console.log('LoginComponent: AuthService methods:', this.authService ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.authService)) : 'authService is null/undefined');
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    console.log('LoginComponent ngOnInit: authService disponível?', !!this.authService);
    
    // Testar conexão com a API
    this.testApiConnection();
    
    // Verificar se há mensagem de redirecionamento
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.loginMessage = params['message'];
      }
    });
  }

  private testApiConnection(): void {
    const apiUrl = this.configService.apiUrl;
    console.log('testApiConnection: URL da API configurada:', apiUrl);
    
    // Testar se o backend está respondendo
    fetch(`${apiUrl}/health`)
      .then(response => {
        console.log('testApiConnection: API respondeu com status:', response.status);
        if (response.ok) {
          console.log('testApiConnection: API está funcionando');
        } else {
          console.warn('testApiConnection: API respondeu mas com erro:', response.status);
        }
      })
      .catch(error => {
        console.error('testApiConnection: Erro ao conectar com a API:', error);
        console.error('testApiConnection: Verifique se o backend está rodando em:', apiUrl);
      });

    // Testar endpoint de login diretamente com fetch
    console.log('testApiConnection: Testando endpoint de login diretamente...');
    fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'Admin', password: 'Admin' })
    })
    .then(response => {
      console.log('testApiConnection: Login endpoint respondeu:', response.status);
      return response.text();
    })
    .then(data => {
      console.log('testApiConnection: Resposta do login:', data);
    })
    .catch(error => {
      console.error('testApiConnection: Erro no login direto:', error);
    });
  }

  ngAfterViewInit() {
    console.log('LoginComponent ngAfterViewInit: authService disponível?', !!this.authService);
  }

  onSubmit() {
    console.log('onSubmit: Início do método');
    console.log('onSubmit: authService disponível?', !!this.authService);
    console.log('onSubmit: Form válido?', this.loginForm.valid);
    console.log('onSubmit: Form values:', this.loginForm.value);
    
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginMessage = '';
      
      const loginData: LoginRequest = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value
      };

      console.log('onSubmit: Login data preparado:', loginData);
      
      try {
        console.log('onSubmit: Tentando login com API...');
        this.performApiLogin(loginData);
      } catch (error) {
        console.error('onSubmit: Erro ao chamar método de login:', error);
        this.isLoading = false;
        this.loginMessage = 'Erro interno do sistema. Tente recarregar a página.';
      }
    } else {
      console.log('onSubmit: Form inválido, marcando campos como touched');
      this.markFormGroupTouched();
    }
  }

  // Método para testar login com credenciais fixas
  testAdminLogin() {
    console.log('testAdminLogin: Testando login com Admin');
    this.isLoading = true;
    this.loginMessage = '';
    
    const testCredentials: LoginRequest = {
      username: 'Admin',
      password: 'admin123' // ou a senha que você está usando
    };
    
    console.log('testAdminLogin: Usando credenciais:', testCredentials);
    this.performApiLogin(testCredentials);
  }

  // Método para testar diferentes endpoints
  testDifferentEndpoints() {
    const baseUrl = 'http://localhost:8080';
    const credentials = { username: 'Admin', password: 'Admin' };
    
    const endpoints = [
      `${baseUrl}/api/auth/login`,
      `${baseUrl}/auth/login`,
      `${baseUrl}/login`,
      `${baseUrl}/api/login`
    ];

    endpoints.forEach(endpoint => {
      console.log(`Testando endpoint: ${endpoint}`);
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      })
      .then(response => {
        console.log(`${endpoint} - Status: ${response.status}`);
        if (response.status !== 404) {
          return response.text().then(text => {
            console.log(`${endpoint} - Resposta:`, text);
            return text;
          });
        }
        return Promise.resolve('404 - Not Found');
      })
      .catch(error => {
        console.log(`${endpoint} - Erro:`, error.message);
      });
    });
  }

  private performApiLogin(loginData: LoginRequest): void {
    console.log('performApiLogin: Dados sendo enviados:', loginData);
    console.log('performApiLogin: AuthService disponível?', !!this.authService);
    
    this.authService.login(loginData).pipe(
      map((response: any) => {
        console.log('performApiLogin: Response recebida:', response);
        return response.user;
      })
    ).subscribe({
      next: (user: any) => {
        console.log('performApiLogin: Sucesso - usuário:', user);
        this.handleLoginSuccess(user);
      },
      error: (error: any) => {
        console.error('performApiLogin: Erro completo:', error);
        console.error('performApiLogin: Status do erro:', error.status);
        console.error('performApiLogin: Mensagem do erro:', error.message);
        console.error('performApiLogin: Erro.error:', error.error);
        this.handleLoginError(error);
      }
    });
  }

  private handleLoginSuccess(user: any): void {
    this.isLoading = false;
    console.log('Login bem-sucedido:', user);
    
    // Verificar se há redirecionamento pendente
    const redirectUrl = this.storageService.getItem('redirectAfterLogin');
    if (redirectUrl) {
      this.storageService.removeItem('redirectAfterLogin');
      this.router.navigate([redirectUrl]);
    } else {
      // Se é admin, redirecionar para o painel admin
      if (user.role === 'ADMIN') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  private handleLoginError(error: any): void {
    this.isLoading = false;
    console.error('handleLoginError: Erro completo:', error);
    console.error('handleLoginError: error.status:', error.status);
    console.error('handleLoginError: error.error:', error.error);
    console.error('handleLoginError: error.message:', error.message);
    
    if (error.status === 401) {
      this.loginMessage = 'Usuário ou senha inválidos. Tente novamente.';
    } else if (error.status === 403) {
      this.loginMessage = 'Acesso negado. Verifique suas credenciais.';
    } else if (error.status === 0 || error.status === undefined) {
      this.loginMessage = 'Erro de conexão. Verifique se o servidor está rodando na porta 8080.';
      console.error('handleLoginError: Possível erro de CORS ou servidor indisponível');
    } else if (error.status >= 500) {
      this.loginMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
    } else {
      // Mostra a mensagem de erro do backend se disponível
      const backendMessage = error.error?.message || error.error?.error || error.message;
      this.loginMessage = backendMessage || `Erro no servidor (${error.status}). Tente novamente.`;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName === 'username' ? 'Nome de usuário' : 'Senha'} é obrigatório`;
      }
      if (field.errors['minlength']) {
        if (fieldName === 'username') {
          return 'Nome de usuário deve ter pelo menos 3 caracteres';
        }
        return 'Senha deve ter pelo menos 3 caracteres';
      }
    }
    return '';
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
