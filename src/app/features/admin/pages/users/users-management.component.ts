import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/api-models';

// Interface estendida para compatibilidade com o template
interface UserExtended extends User {
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
  users: UserExtended[] = [];
  filteredUsers: UserExtended[] = [];
  
  // Form states
  showForm = false;
  editingUser: UserExtended | null = null;
  isLoading = true;
  isSaving = false;
  
  // Form data
  userForm = {
    username: '',
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
    private authService: AuthService,
    private userService: UserService
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
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        // Mapear para UserExtended com propriedades de compatibilidade
        this.users = (users || []).map(user => ({
          ...user,
          ordersCount: 0 // Valor padrão, pode ser obtido de outro endpoint futuramente
        }));
        this.applyFilters();
        this.isLoading = false;
        console.log('UsersManagement - Usuários carregados:', this.users);
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.users = [];
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    console.log('UsersManagement - Aplicando filtros...');
    console.log('Users originais:', this.users.length);
    console.log('Search term:', this.searchTerm);
    console.log('Filter role:', this.filterRole);
    console.log('Filter active:', this.filterActive);
    
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (user.fullName && user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesRole = this.filterRole === 'all' || user.role === this.filterRole;
      
      const matchesActive = this.filterActive === 'all' || 
                           (this.filterActive === 'active' && user.isActive !== false) ||
                           (this.filterActive === 'inactive' && user.isActive === false);
      
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
      fullName: '',
      role: 'USER',
      isActive: true,
      password: '',
      confirmPassword: ''
    };
    this.showForm = true;
  }

  openEditForm(user: UserExtended) {
    this.editingUser = user;
    this.userForm = {
      username: user.username,
      fullName: user.fullName || '',
      role: user.role,
      isActive: user.isActive !== false,
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
      fullName: '',
      role: 'USER',
      isActive: true,
      password: '',
      confirmPassword: ''
    };
  }

  saveUser() {
    // Validações básicas
    if (!this.userForm.username.trim() || !this.userForm.fullName.trim()) {
      alert('Nome completo e nome de usuário são obrigatórios!');
      return;
    }

    if (!this.editingUser && (!this.userForm.password || this.userForm.password !== this.userForm.confirmPassword)) {
      alert('Senha e confirmação de senha devem ser iguais!');
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

    console.log('Salvando usuário:', { 
      isEdit: !!this.editingUser, 
      userId: this.editingUser?.id, 
      userData: this.userForm 
    });

    if (this.editingUser) {
      // Para edição, usar apenas os campos necessários
      const updateData = {
        username: this.userForm.username.trim(),
        userRole: this.userForm.role as 'USER' | 'ADMIN'
      };
      
      // Adicionar senha apenas se foi fornecida
      if (this.userForm.password) {
        (updateData as any).password = this.userForm.password;
      }

      this.userService.updateUser(this.editingUser.id, updateData).subscribe({
        next: (savedUser) => this.handleUserSaveSuccess(savedUser, true),
        error: (error) => this.handleUserSaveError(error)
      });
    } else {
      // Para criação, usar dados compatíveis com o endpoint de registro
      const createData = {
        username: this.userForm.username.trim(),
        password: this.userForm.password,
        fullName: this.userForm.fullName.trim()
      };

      console.log('Criando novo usuário com dados:', createData);
      console.log('Role selecionado:', this.userForm.role);

      this.userService.createUserAdmin(createData).subscribe({
        next: (savedUser) => {
          console.log('Usuário criado com sucesso:', savedUser);
          
          // Se o role selecionado for ADMIN, precisamos fazer uma edição adicional
          if (this.userForm.role === 'ADMIN') {
            console.log('Usuário deve ser ADMIN, fazendo edição para alterar role...');
            this.promoteUserToAdmin(savedUser.username);
          } else {
            this.handleUserSaveSuccess(savedUser, false);
          }
        },
        error: (error) => this.handleUserSaveError(error)
      });
    }
  }

  private handleUserSaveSuccess(savedUser: any, isEdit: boolean) {
    console.log('Usuário salvo com sucesso:', savedUser);
    
    if (isEdit) {
      // Atualizar usuário existente na lista local
      const index = this.users.findIndex(u => u.id === this.editingUser!.id);
      if (index !== -1) {
        this.users[index] = {
          ...savedUser,
          ordersCount: this.users[index].ordersCount
        };
        console.log('Usuário atualizado na lista local');
      }
      this.applyFilters();
      this.closeForm();
      this.isSaving = false;
    } else {
      // Para criação, recarregar a lista completa da API
      console.log('Novo usuário criado, recarregando lista da API...');
      this.closeForm();
      this.isSaving = false;
      
      // Recarregar a lista de usuários da API
      this.loadUsers();
    }
  }

  private handleUserSaveError(error: any) {
    console.error('Erro ao salvar usuário:', error);
    this.isSaving = false;
    
    // Tratar diferentes tipos de erro
    let errorMessage = 'Erro ao salvar usuário. Tente novamente.';
    
    if (error.status === 400) {
      errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
    } else if (error.status === 409) {
      errorMessage = 'Nome de usuário já existe. Escolha outro nome.';
    } else if (error.status === 403) {
      errorMessage = 'Você não tem permissão para realizar esta operação.';
    }
    
    alert(errorMessage);
  }

  toggleUserStatus(user: User) {
    if (confirm(`Deseja ${user.isActive ? 'desativar' : 'ativar'} o usuário "${user.fullName}"?`)) {
      user.isActive = !user.isActive;
      this.applyFilters();
    }
  }

  deleteUser(user: UserExtended) {
    if (user.role === 'ADMIN') {
      alert('Não é possível excluir usuários administradores!');
      return;
    }

    const userName = user.fullName || user.username;

    if (confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Erro ao deletar usuário:', error);
          // Aqui você pode adicionar uma notificação de erro
          alert('Erro ao deletar usuário. Tente novamente.');
        }
      });
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

  private promoteUserToAdmin(username: string) {
    console.log('Promovendo usuário para ADMIN:', username);
    
    // Primeiro, recarregar a lista para encontrar o usuário criado
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const newUser = users.find(u => u.username === username);
        if (newUser) {
          console.log('Usuário encontrado, alterando role para ADMIN:', newUser);
          
          // Atualizar o usuário para ADMIN
          const updateData = {
            username: newUser.username,
            userRole: 'ADMIN' as 'ADMIN'
          };
          
          this.userService.updateUser(newUser.id, updateData).subscribe({
            next: (updatedUser) => {
              console.log('Usuário promovido para ADMIN com sucesso:', updatedUser);
              this.handleUserSaveSuccess(updatedUser, false);
            },
            error: (error) => {
              console.error('Erro ao promover usuário para ADMIN:', error);
              // Mesmo com erro na promoção, o usuário foi criado
              this.handleUserSaveSuccess(newUser, false);
              alert('Usuário criado com sucesso, mas ocorreu um erro ao definir como Administrador. Você pode editá-lo posteriormente.');
            }
          });
        } else {
          console.error('Usuário criado não encontrado na lista');
          this.handleUserSaveSuccess({ username }, false);
        }
      },
      error: (error) => {
        console.error('Erro ao recarregar lista de usuários:', error);
        this.handleUserSaveSuccess({ username }, false);
      }
    });
  }
}
