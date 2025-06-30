// Arquivo vazio - removido para evitar conflitos

  ngOnInit() {
    console.log('UsersManagement - ngOnInit chamado');
    this.checkAdminAuth();
    this.loadUsers();
  }

  checkAdminAuth() {
    const token = this.storageService.getItem('authToken');
    const userRole = this.storageService.getItem('userRole');
    
    console.log('UsersManagement - Verificando autenticação:', {
      token: token ? 'PRESENTE' : 'AUSENTE',
      userRole: userRole
    });
    
    if (!token || userRole !== 'ADMIN') {
      console.log('UsersManagement - Redirecionando para login: token ou role inválidos');
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
    if (this.isFormValid()) {
      this.isSaving = true;
      
      setTimeout(() => {
        if (this.editingUser) {
          // Editar usuário existente
          const index = this.users.findIndex(u => u.id === this.editingUser!.id);
          if (index >= 0) {
            this.users[index] = {
              ...this.users[index],
              username: this.userForm.username,
              email: this.userForm.email,
              fullName: this.userForm.fullName,
              role: this.userForm.role,
              isActive: this.userForm.isActive
            };
          }
        } else {
          // Criar novo usuário
          const newId = Math.max(...this.users.map(u => u.id)) + 1;
          const newUser: User = {
            id: newId,
            username: this.userForm.username,
            email: this.userForm.email,
            fullName: this.userForm.fullName,
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
      }, 1000);
    }
  }

  deleteUser(user: User) {
    if (confirm(`Tem certeza que deseja excluir o usuário "${user.fullName}"?`)) {
      const index = this.users.findIndex(u => u.id === user.id);
      if (index >= 0) {
        this.users.splice(index, 1);
        this.applyFilters();
      }
    }
  }

  toggleUserStatus(user: User) {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      this.users[index].isActive = !this.users[index].isActive;
      this.applyFilters();
    }
  }

  resetPassword(user: User) {
    if (confirm(`Tem certeza que deseja resetar a senha do usuário "${user.fullName}"?`)) {
      // Simular reset de senha
      alert('Email com nova senha enviado para o usuário.');
    }
  }

  isFormValid(): boolean {
    return this.userForm.username.length >= 3 &&
           this.userForm.email.includes('@') &&
           this.userForm.fullName.length >= 3 &&
           (!this.editingUser ? this.userForm.password.length >= 6 : true);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
