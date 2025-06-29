import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  // Links organizados por categoria
  companyLinks = [
    { name: 'Sobre Nós', route: '/about' },
    { name: 'Trabalhe Conosco', route: '/careers' },
    { name: 'Imprensa', route: '/press' },
    { name: 'Investidores', route: '/investors' }
  ];

  helpLinks = [
    { name: 'Central de Ajuda', route: '/help' },
    { name: 'Como Comprar', route: '/help/how-to-buy' },
    { name: 'Frete e Entrega', route: '/help/shipping' },
    { name: 'Trocas e Devoluções', route: '/help/returns' },
    { name: 'Política de Privacidade', route: '/privacy' },
    { name: 'Termos de Uso', route: '/terms' }
  ];

  categoryLinks = [
    { name: 'Ficção', route: '/books?genre=ficcao' },
    { name: 'Romance', route: '/books?genre=romance' },
    { name: 'Suspense', route: '/books?genre=suspense' },
    { name: 'Fantasia', route: '/books?genre=fantasia' },
    { name: 'Biografia', route: '/books?genre=biografia' },
    { name: 'História', route: '/books?genre=historia' },
    { name: 'Ciência', route: '/books?genre=ciencia' },
    { name: 'Infantil', route: '/books?genre=infantil' }
  ];

  socialLinks = [
    { 
      name: 'Facebook', 
      url: 'https://facebook.com/elivro', 
      icon: 'facebook' 
    },
    { 
      name: 'Instagram', 
      url: 'https://instagram.com/elivro', 
      icon: 'instagram' 
    },
    { 
      name: 'Twitter', 
      url: 'https://twitter.com/elivro', 
      icon: 'twitter' 
    },
    { 
      name: 'YouTube', 
      url: 'https://youtube.com/elivro', 
      icon: 'youtube' 
    },
    { 
      name: 'LinkedIn', 
      url: 'https://linkedin.com/company/elivro', 
      icon: 'linkedin' 
    }
  ];

  paymentMethods = [
    { name: 'Visa', icon: 'visa' },
    { name: 'Mastercard', icon: 'mastercard' },
    { name: 'Elo', icon: 'elo' },
    { name: 'PIX', icon: 'pix' },
    { name: 'Boleto', icon: 'boleto' }
  ];

  securityCertifications = [
    { name: 'SSL Seguro', icon: 'ssl' },
    { name: 'Site Blindado', icon: 'site-blindado' },
    { name: 'Reclame Aqui', icon: 'reclame-aqui' }
  ];
}
