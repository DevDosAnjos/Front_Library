import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { SimpleAuthService } from '../../../../core/services/simple-auth.service';

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
    private authService: SimpleAuthService
  ) {
    console.log('LoginComponent: Construtor chamado');
    console.log('LoginComponent: SimpleAuthService injetado?', !!this.authService);
    console.log('LoginComponent: SimpleAuthService methods:', this.authService ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.authService)) : 'authService is null/undefined');
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    console.log('LoginComponent ngOnInit: authService disponível?', !!this.authService);
    console.log('LoginComponent ngOnInit: loginMock method exists?', this.authService && typeof this.authService.loginMock === 'function');
    
    // Verificar se há mensagem de redirecionamento
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.loginMessage = params['message'];
      }
    });
  }

  ngAfterViewInit() {
    console.log('LoginComponent ngAfterViewInit: authService disponível?', !!this.authService);
    console.log('LoginComponent ngAfterViewInit: loginMock method exists?', this.authService && typeof this.authService.loginMock === 'function');
  }

  onSubmit() {
    console.log('onSubmit: Início do método');
    console.log('onSubmit: authService disponível?', !!this.authService);
    
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      const loginData = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value
      };

      console.log('Login data:', loginData);
      
      // Tentar fazer login diretamente, sem verificações complexas
      try {
        console.log('Tentando chamar loginMock...');
        this.authService.loginMock(loginData.username, loginData.password).subscribe({
          next: (user: any) => {
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
          },
          error: (error: any) => {
            this.isLoading = false;
            console.error('Erro no login:', error);
            this.loginMessage = 'Erro ao fazer login. Tente novamente.';
          }
        });
      } catch (error) {
        console.error('Erro ao chamar loginMock:', error);
        this.isLoading = false;
        this.loginMessage = 'Erro interno do sistema. Tente recarregar a página.';
      }
    } else {
      this.markFormGroupTouched();
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
        return 'Senha deve ter pelo menos 6 caracteres';
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
