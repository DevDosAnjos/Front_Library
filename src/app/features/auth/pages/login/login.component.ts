import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  loginMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Verificar se há mensagem de redirecionamento
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.loginMessage = params['message'];
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      const loginData = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value
      };

      console.log('Login data:', loginData);
      
      // Simular chamada de API e login bem-sucedido
      setTimeout(() => {
        this.isLoading = false;
        
        // Simular token e dados do usuário
        this.storageService.setItem('authToken', 'fake-jwt-token-' + Date.now());
        this.storageService.setItem('userName', loginData.username);
        this.storageService.setItem('userRole', 'USER');
        
        // Verificar se há redirecionamento pendente
        const redirectUrl = this.storageService.getItem('redirectAfterLogin');
        if (redirectUrl) {
          this.storageService.removeItem('redirectAfterLogin');
          this.router.navigate([redirectUrl]);
        } else {
          this.router.navigate(['/']);
        }
      }, 2000);
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
