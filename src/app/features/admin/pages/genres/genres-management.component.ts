import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';

@Component({
  selector: 'app-genres-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="genres-management">
      <div class="management-header">
        <div class="header-content">
          <div class="header-info">
            <button class="btn btn-back" (click)="goBack()">
              <i class="fas fa-arrow-left"></i>
              Voltar ao Dashboard
            </button>
            <h1 class="page-title">
              <i class="fas fa-tags"></i>
              Gerenciamento de Gêneros
            </h1>
            <p class="page-subtitle">Em desenvolvimento...</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .genres-management {
      min-height: calc(100vh - 120px);
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      color: #ffffff;
    }
    .management-header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      border-bottom: 2px solid #00ff66;
      padding: 2rem 0;
    }
    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    .page-title {
      font-size: 2.2rem;
      font-weight: 700;
      color: #00ff66;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .page-subtitle {
      color: #cccccc;
      font-size: 1rem;
      margin: 0;
    }
    .btn-back {
      background: transparent;
      color: #cccccc;
      border: 2px solid #666666;
      margin-bottom: 1rem;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .btn-back:hover {
      border-color: #00ff66;
      color: #00ff66;
    }
  `]
})
export class GenresManagementComponent implements OnInit {
  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.checkAdminAuth();
  }

  checkAdminAuth() {
    const token = this.storageService.getItem('authToken');
    const userRole = this.storageService.getItem('userRole');
    
    if (!token || userRole !== 'ADMIN') {
      this.router.navigate(['/auth/login'], {
        queryParams: { message: 'Acesso restrito a administradores.' }
      });
      return;
    }
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
