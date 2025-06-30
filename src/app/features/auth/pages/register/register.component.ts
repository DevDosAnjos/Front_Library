import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  registerMessage = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    console.log('RegisterComponent: Construtor chamado');
    console.log('RegisterComponent: AuthService injetado?', !!this.authService);
    
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Verificar se há mensagem de redirecionamento
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.registerMessage = params['message'];
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    console.log('RegisterComponent.onSubmit: Iniciando registro');
    
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const registerData: RegisterRequest = {
        username: this.registerForm.get('username')?.value,
        password: this.registerForm.get('password')?.value,
        role: 'USER' // Sempre USER para novos registros
      };

      console.log('RegisterComponent.onSubmit: Dados do registro:', registerData);
      console.log('RegisterComponent.onSubmit: AuthService disponível?', !!this.authService);
      
      // Chamar API real através do AuthService
      this.authService.register(registerData).subscribe({
        next: (response: any) => {
          console.log('RegisterComponent.onSubmit: Registro bem-sucedido:', response);
          this.isLoading = false;
          
          // Como sua API sempre retorna apenas username, sempre redireciona para login
          if (response && response.success && response.requiresLogin) {
            console.log('RegisterComponent.onSubmit: Registro sem autenticação automática - redirecionando para login');
            this.successMessage = response.message || 'Usuário registrado com sucesso!';
            
            // Aguardar um pouco para mostrar a mensagem e redirecionar para login
            setTimeout(() => {
              console.log('RegisterComponent.onSubmit: Redirecionando para login...');
              this.router.navigate(['/auth/login'], { 
                queryParams: { 
                  message: 'Registro realizado com sucesso! Faça login para continuar.',
                  username: response.username 
                } 
              });
            }, 2000);
          } else {
            console.error('RegisterComponent.onSubmit: Resposta inesperada do backend:', response);
            this.errorMessage = 'Erro inesperado durante o registro';
          }
        },
        error: (error: any) => {
          console.error('RegisterComponent.onSubmit: Erro no registro:', error);
          this.isLoading = false;
          
          // Tratar diferentes tipos de erro
          if (error.status === 409) {
            this.errorMessage = 'Nome de usuário já existe. Escolha outro.';
          } else if (error.status === 400) {
            this.errorMessage = 'Dados inválidos. Verifique os campos.';
          } else if (error.status === 403) {
            this.errorMessage = 'Acesso negado. Verifique a configuração do servidor.';
          } else {
            this.errorMessage = 'Erro ao registrar usuário. Tente novamente.';
          }
          
          console.log('RegisterComponent.onSubmit: Mensagem de erro definida:', this.errorMessage);
        }
      });
    } else {
      console.log('RegisterComponent.onSubmit: Formulário inválido');
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        switch (fieldName) {
          case 'username': return 'Nome de usuário é obrigatório';
          case 'password': return 'Senha é obrigatória';
          case 'confirmPassword': return 'Confirmação de senha é obrigatória';
          case 'acceptTerms': return 'Você deve aceitar os termos';
          default: return 'Campo obrigatório';
        }
      }
      if (field.errors['minlength']) {
        if (fieldName === 'username') {
          return 'Nome de usuário deve ter pelo menos 3 caracteres';
        }
        return 'Senha deve ter pelo menos 6 caracteres';
      }
      if (field.errors['requiredTrue']) {
        return 'Você deve aceitar os termos de uso';
      }
    }
    
    // Verificar erro de senha não conferir
    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch']) {
      const confirmField = this.registerForm.get('confirmPassword');
      if (confirmField?.touched) {
        return 'As senhas não conferem';
      }
    }
    
    return '';
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
