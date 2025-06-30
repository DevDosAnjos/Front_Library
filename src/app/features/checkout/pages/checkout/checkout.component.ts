import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../../../core/services/cart.service';
import { StorageService } from '../../../../core/services/storage.service';
import { Cart, CartItem } from '../../../../core/models/api-models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cart: Cart = { 
    items: [], 
    totalItems: 0, 
    totalPrice: 0,
    updatedAt: new Date()
  };
  checkoutForm: FormGroup;
  isLoading = false;
  isProcessing = false;
  currentStep = 1;
  totalSteps = 3;
  
  private cartSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cartService: CartService,
    private storageService: StorageService
  ) {
    this.checkoutForm = this.fb.group({
      // Dados Pessoais
      personalData: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
        cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]]
      }),
      
      // Endereço de Entrega
      shippingAddress: this.fb.group({
        cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
        street: ['', [Validators.required]],
        number: ['', [Validators.required]],
        complement: [''],
        neighborhood: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]]
      }),
      
      // Pagamento
      payment: this.fb.group({
        method: ['credit_card', [Validators.required]],
        creditCard: this.fb.group({
          number: ['', [Validators.required, Validators.pattern(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/)]],
          name: ['', [Validators.required]],
          expiry: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
          cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
          installments: [1, [Validators.required]]
        })
      })
    });
  }

  ngOnInit() {
    this.loadCart();
    this.checkAuthAndRedirect();
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  checkAuthAndRedirect() {
    const token = this.storageService.getItem('authToken');
    if (!token) {
      // Usuário não autenticado - redirecionar para login
      this.storageService.setItem('redirectAfterLogin', '/checkout');
      this.router.navigate(['/auth/login'], { 
        queryParams: { message: 'Você precisa estar logado para finalizar sua compra.' }
      });
      return;
    }
  }

  loadCart() {
    this.isLoading = true;
    
    this.cartSubscription = this.cartService.cart$.subscribe({
      next: (cart) => {
        this.cart = cart;
        this.isLoading = false;
        
        // Se carrinho vazio, redirecionar
        if (cart.items.length === 0) {
          this.router.navigate(['/cart']);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar carrinho:', error);
        this.isLoading = false;
        this.router.navigate(['/cart']);
      }
    });
  }

  // Navegação entre steps
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      if (this.isCurrentStepValid()) {
        this.currentStep++;
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step <= this.currentStep || this.isStepAccessible(step)) {
      this.currentStep = step;
    }
  }

  isCurrentStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.checkoutForm.get('personalData')?.valid || false;
      case 2:
        return this.checkoutForm.get('shippingAddress')?.valid || false;
      case 3:
        return this.checkoutForm.get('payment')?.valid || false;
      default:
        return false;
    }
  }

  isStepAccessible(step: number): boolean {
    // Lógica para determinar se um step pode ser acessado
    switch (step) {
      case 1:
        return true;
      case 2:
        return this.checkoutForm.get('personalData')?.valid || false;
      case 3:
        return (this.checkoutForm.get('personalData')?.valid || false) && 
               (this.checkoutForm.get('shippingAddress')?.valid || false);
      default:
        return false;
    }
  }

  // Formatação e validação
  formatPhone(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
      this.checkoutForm.get('personalData.phone')?.setValue(value);
    }
  }

  formatCPF(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{2})$/, '$1-$2');
      this.checkoutForm.get('personalData.cpf')?.setValue(value);
    }
  }

  formatCEP(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
      this.checkoutForm.get('shippingAddress.cep')?.setValue(value);
    }
  }

  formatCreditCard(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 16) {
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
      this.checkoutForm.get('payment.creditCard.number')?.setValue(value);
    }
  }

  formatExpiry(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      value = value.replace(/(\d{2})(\d)/, '$1/$2');
      this.checkoutForm.get('payment.creditCard.expiry')?.setValue(value);
    }
  }

  // Consulta CEP (simulada)
  consultCEP() {
    const cep = this.checkoutForm.get('shippingAddress.cep')?.value;
    if (cep && cep.length === 9) {
      // Simular consulta de CEP
      setTimeout(() => {
        this.checkoutForm.patchValue({
          shippingAddress: {
            street: 'Rua das Flores',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP'
          }
        });
      }, 1000);
    }
  }

  // Finalizar compra
  finishOrder() {
    if (this.checkoutForm.valid && this.cart.items.length > 0) {
      this.isProcessing = true;

      const orderData = {
        items: this.cart.items,
        personalData: this.checkoutForm.get('personalData')?.value,
        shippingAddress: this.checkoutForm.get('shippingAddress')?.value,
        payment: this.checkoutForm.get('payment')?.value,
        totalPrice: this.cart.totalPrice,
        totalItems: this.cart.totalItems,
        orderDate: new Date().toISOString()
      };

      console.log('Dados do pedido:', orderData);

      // Simular processamento do pedido
      setTimeout(() => {
        this.isProcessing = false;
        
        // Limpar carrinho
        this.cartService.clearCart();
        
        // Salvar pedido no localStorage (simulação)
        const orderId = 'PED-' + Date.now();
        this.storageService.setObject(`order_${orderId}`, orderData);
        
        // Redirecionar para página de sucesso
        this.router.navigate(['/order-success'], { 
          queryParams: { orderId: orderId }
        });
      }, 3000);
    } else {
      this.markFormGroupTouched();
    }
  }

  // Utilitários
  formatPrice(price: number): string {
    return `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
  }

  getGenderName(genderId: number): string {
    const genderMap: { [key: number]: string } = {
      1: 'Ficção Científica',
      2: 'Fantasia', 
      3: 'Suspense e Mistério',
      4: 'Romance',
      5: 'Literatura Clássica',
      6: 'Biografias e Memórias',
      7: 'História',
      8: 'Tecnologia e Ciência',
      9: 'Mangás e HQs',
      10: 'Autoajuda',
      11: 'Infantojuvenil',
      12: 'Gastronomia'
    };
    
    return genderMap[genderId] || 'Gênero desconhecido';
  }

  getFieldError(fieldPath: string): string {
    const field = this.checkoutForm.get(fieldPath);
    if (field?.errors && field.touched) {
      const fieldName = fieldPath.split('.').pop() || '';
      
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} é obrigatório`;
      }
      if (field.errors['email']) {
        return 'E-mail deve ter um formato válido';
      }
      if (field.errors['pattern']) {
        return `${this.getFieldDisplayName(fieldName)} deve ter um formato válido`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      fullName: 'Nome completo',
      email: 'E-mail',
      phone: 'Telefone',
      cpf: 'CPF',
      cep: 'CEP',
      street: 'Rua',
      houseNumber: 'Número',
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'Estado',
      cardNumber: 'Número do cartão',
      name: 'Nome no cartão',
      expiry: 'Validade',
      cvv: 'CVV'
    };
    
    return displayNames[fieldName] || fieldName;
  }

  private markFormGroupTouched() {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(subKey => {
          const subControl = control.get(subKey);
          subControl?.markAsTouched();
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  continueShopping() {
    this.router.navigate(['/books']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  trackByBookId(index: number, item: CartItem): number {
    return item.book.id;
  }

  onImageError(event: any) {
    event.target.src = '/assets/images/book-placeholder.jpg';
  }
}
