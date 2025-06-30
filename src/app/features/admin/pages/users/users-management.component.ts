import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { AuthService } from '../../../../core/services/auth.service';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  ordersCount?: number;
}

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.css'
})
export class UsersManagementComponentFixed implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  
  // Form states
  showForm = false;
  editingUser: User | null = null;
  isLoading = true;
  isSaving = false;
  
  // Form data
  userForm = {
    username: '',
    email: '',
    fullName: '',
    role: 'USER' as 'USER' | 'ADMIN',
    isActive: true,
    password: '',
    confirmPassword: ''
  };
  
  // Filters and search
  searchTerm = '';
  filterRole = 'all'; // 'all', 'USER', 'ADMIN'
  filterActive = 'all'; // 'all', 'active', 'inactive'

  constructor(
    private router: Router,
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('UsersManagement - ngOnInit chamado');
    this.checkAdminAuth();
    this.loadUsers();
  }


  checkAdminAuth() {
    console.log('UsersManagement - ngOnInit chamado');
    
    // Verificar através do AuthService
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      console.log('UsersManagement - Redirecionando para login: não autenticado ou não é admin');
      this.router.navigate(['/auth/login'], {
        queryParams: { message: 'Acesso restrito a administradores.' }
      });
      return;
    }
    
    console.log('UsersManagement - Autenticação OK, carregando dados...');
  }

  loadUsers() {
    console.log('UsersManagement - Iniciando carregamento de usuários...');
    this.isLoading = true;
    
    // Simular dados de usuários
    setTimeout(() => {
      console.log('UsersManagement - Simulando carregamento de dados...');
      this.users = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@elivro.com',
          fullName: 'Administrador do Sistema',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          lastLogin: new Date('2025-06-29T10:30:00'),
          ordersCount: 0
        },
        {
          id: 2,
          username: 'maria.silva',
          email: 'maria.silva@email.com',
          fullName: 'Maria Silva Santos',
          role: 'USER',
          isActive: true,
          createdAt: new Date('2024-02-15'),
          lastLogin: new Date('2025-06-28T16:45:00'),
          ordersCount: 12
        },
        {
          id: 3,
          username: 'joao.santos',
          email: 'joao.santos@email.com',
          fullName: 'João Santos Oliveira',
          role: 'USER',
          isActive: true,
          createdAt: new Date('2024-03-10'),
          lastLogin: new Date('2025-06-27T14:20:00'),
          ordersCount: 8
        },
        {
          id: 4,
          username: 'ana.costa',
          email: 'ana.costa@email.com',
          fullName: 'Ana Costa Lima',
          role: 'USER',
          isActive: false,
          createdAt: new Date('2024-04-20'),
          lastLogin: new Date('2025-05-15T09:15:00'),
          ordersCount: 3
        },
        {
          id: 5,
          username: 'carlos.admin',
          email: 'carlos@elivro.com',
          fullName: 'Carlos Administrador',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date('2024-01-05'),
          lastLogin: new Date('2025-06-26T11:30:00'),
          ordersCount: 0
        }
      ];
      
      console.log('UsersManagement - Usuários carregados:', this.users.length, 'usuários');
      this.applyFilters();
      this.isLoading = false;
      console.log('UsersManagement - Carregamento concluído. isLoading:', this.isLoading);
    }, 1000);
  }

  applyFilters() {
    console.log('UsersManagement - Aplicando filtros...');
    console.log('Users originais:', this.users.length);
    console.log('Search term:', this.searchTerm);
    console.log('Filter role:', this.filterRole);
    console.log('Filter active:', this.filterActive);
    
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = this.filterRole === 'all' || user.role === this.filterRole;
      
      const matchesActive = this.filterActive === 'all' || 
                           (this.filterActive === 'active' && user.isActive) ||
                           (this.filterActive === 'inactive' && !user.isActive);
      
      return matchesSearch && matchesRole && matchesActive;
    });
    
    console.log('Filtered users:', this.filteredUsers.length);
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  openCreateForm() {
    this.editingUser = null;
    this.userForm = {
      username: '',
      email: '',
      fullName: '',
      role: 'USER',
      isActive: true,
      password: '',
      confirmPassword: ''
    };
    this.showForm = true;
  }

  openEditForm(user: User) {
    this.editingUser = user;
    this.userForm = {
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      password: '',
      confirmPassword: ''
    };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingUser = null;
    this.userForm = {
      username: '',
      email: '',
      fullName: '',
      role: 'USER',
      isActive: true,
      password: '',
      confirmPassword: ''
    };
  }

  saveUser() {
    // Validações básicas
    if (!this.userForm.username.trim() || !this.userForm.email.trim() || !this.userForm.fullName.trim()) {
      alert('Todos os campos obrigatórios devem ser preenchidos!');
      return;
    }

    if (!this.editingUser && (!this.userForm.password || this.userForm.password !== this.userForm.confirmPassword)) {
      alert('Senha e confirmação de senha devem ser iguais!');
      return;
    }

    // Verificar email único
    const existingUser = this.users.find(u => 
      u.email === this.userForm.email && (!this.editingUser || u.id !== this.editingUser.id)
    );
    if (existingUser) {
      alert('Este email já está em uso por outro usuário!');
      return;
    }

    // Verificar username único
    const existingUsername = this.users.find(u => 
      u.username === this.userForm.username && (!this.editingUser || u.id !== this.editingUser.id)
    );
    if (existingUsername) {
      alert('Este nome de usuário já está em uso!');
      return;
    }

    this.isSaving = true;

    setTimeout(() => {
      if (this.editingUser) {
        // Editar usuário existente
        const index = this.users.findIndex(u => u.id === this.editingUser!.id);
        if (index !== -1) {
          this.users[index] = {
            ...this.users[index],
            username: this.userForm.username.trim(),
            email: this.userForm.email.trim(),
            fullName: this.userForm.fullName.trim(),
            role: this.userForm.role,
            isActive: this.userForm.isActive
          };
        }
      } else {
        // Criar novo usuário
        const newUser: User = {
          id: Math.max(...this.users.map(u => u.id)) + 1,
          username: this.userForm.username.trim(),
          email: this.userForm.email.trim(),
          fullName: this.userForm.fullName.trim(),
          role: this.userForm.role,
          isActive: this.userForm.isActive,
          createdAt: new Date(),
          ordersCount: 0
        };
        this.users.push(newUser);
      }

      this.applyFilters();
      this.closeForm();
      this.isSaving = false;
    }, 1200);
  }

  toggleUserStatus(user: User) {
    if (confirm(`Deseja ${user.isActive ? 'desativar' : 'ativar'} o usuário "${user.fullName}"?`)) {
      user.isActive = !user.isActive;
      this.applyFilters();
    }
  }

  deleteUser(user: User) {
    if (user.role === 'ADMIN') {
      alert('Não é possível excluir usuários administradores!');
      return;
    }

    if (user.ordersCount && user.ordersCount > 0) {
      alert(`Não é possível excluir o usuário "${user.fullName}" pois possui ${user.ordersCount} pedidos vinculados.`);
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o usuário "${user.fullName}"? Esta ação não pode ser desfeita.`)) {
      this.users = this.users.filter(u => u.id !== user.id);
      this.applyFilters();
    }
  }

  resetPassword(user: User) {
    if (confirm(`Deseja resetar a senha do usuário "${user.fullName}"? Uma nova senha será gerada e enviada por email.`)) {
      alert(`Senha resetada! Nova senha enviada para ${user.email}`);
    }
  }

  getRoleText(role: string): string {
    return role === 'ADMIN' ? 'Administrador' : 'Usuário';
  }

  getRoleClass(role: string): string {
    return role === 'ADMIN' ? 'role-admin' : 'role-user';
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
