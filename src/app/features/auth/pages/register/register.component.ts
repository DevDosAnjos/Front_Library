import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
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
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      const registerData = {
        username: this.registerForm.get('username')?.value,
        password: this.registerForm.get('password')?.value
      };

      console.log('Register data:', registerData);
      
      // Simular chamada de API
      setTimeout(() => {
        this.isLoading = false;
        // Aqui você implementaria a lógica de registro real
      }, 2000);
    } else {
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
