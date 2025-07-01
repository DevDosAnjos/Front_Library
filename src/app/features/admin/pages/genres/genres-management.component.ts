import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { AuthService } from '../../../../core/services/auth.service';
import { GenderService } from '../../../../core/services/gender.service';
import { BookService } from '../../../../core/services/book.service';
import { Gender, GenderCreateRequest, GenderUpdateRequest } from '../../../../core/models/api-models';

// Interface estendida para compatibilidade com o template
interface GenderExtended extends Gender {
  isActive?: boolean;
  booksCount?: number;
  createdAt?: Date;
}

@Component({
  selector: 'app-genres-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './genres-management.component.html',
  styleUrl: './genres-management.component.css'
})
export class GenresManagementComponent implements OnInit {
  genres: GenderExtended[] = [];
  filteredGenres: GenderExtended[] = [];
  
  // Form states
  showForm = false;
  editingGenre: GenderExtended | null = null;
  isLoading = true;
  isSaving = false;
  
  // Form data
  genreForm = {
    name: '',
    statusGender: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    isActive: true
  };
  
  // Filters and search
  searchTerm = '';
  filterActive = 'all'; // 'all', 'active', 'inactive'

  constructor(
    private router: Router,
    private storageService: StorageService,
    private authService: AuthService,
    private genderService: GenderService,
    private bookService: BookService
  ) {}

  ngOnInit() {
    this.checkAdminAuth();
    this.loadGenres();
  }

  checkAdminAuth() {
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { message: 'Acesso restrito a administradores.' }
      });
      return;
    }
  }

  loadGenres() {
    this.isLoading = true;
    
    console.log('=== COMPONENT: Iniciando carregamento de gêneros ===');
    
    // Usar getAllGenders para admin obter todos os gêneros (ativos e inativos)
    this.genderService.getAllGenders().subscribe({
      next: (genres) => {
        console.log('=== COMPONENT: Gêneros carregados com sucesso ===', genres);
        this.processLoadedGenres(genres || []);
      },
      error: (error) => {
        console.error('=== COMPONENT: Erro ao carregar gêneros ===', error);
        this.genres = [];
        this.filteredGenres = [];
        this.isLoading = false;
        
        // Verificar se é erro de autenticação
        if (error.status === 401 || error.status === 403) {
          alert('Acesso negado. Você precisa estar logado como administrador.');
          this.router.navigate(['/auth/login']);
        } else {
          alert('Erro ao carregar gêneros. Verifique se a API está funcionando corretamente.');
        }
      }
    });
  }

  private processLoadedGenres(genres: Gender[]) {
    this.genres = (genres || []).map(genre => ({
      ...genre,
      isActive: genre.statusGender === 'ACTIVE',
      booksCount: 0, // Será carregado separadamente
      createdAt: new Date()
    }));
    
    console.log('=== COMPONENT: Gêneros processados ===', this.genres);
    
    // Carregar contagem de livros (não crítico)
    this.loadBooksCount();
  }

  /**
   * Carrega a contagem de livros para cada gênero
   */
  loadBooksCount() {
    console.log('=== COMPONENT: Iniciando carregamento de contagem de livros ===');
    
    this.bookService.countBooksByGender().subscribe({
      next: (countMap) => {
        console.log('=== COMPONENT: Contagem de livros carregada ===', countMap);
        // Atualizar contagem nos gêneros
        this.genres.forEach(genre => {
          genre.booksCount = countMap.get(genre.id) || 0;
        });
        
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('=== COMPONENT: Erro ao carregar contagem de livros ===', error);
        
        // Não é crítico - continuar sem a contagem
        this.genres.forEach(genre => {
          genre.booksCount = 0; // Valor padrão
        });
        
        this.applyFilters();
        this.isLoading = false;
        
        // Mostrar mensagem informativa em vez de bloquear a interface
        console.warn('Dashboard de gêneros carregado sem contagem de livros (API de livros indisponível)');
      }
    });
  }

  applyFilters() {
    this.filteredGenres = this.genres.filter(genre => {
      const matchesSearch = genre.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesFilter = this.filterActive === 'all' || 
                           (this.filterActive === 'active' && genre.statusGender === 'ACTIVE') ||
                           (this.filterActive === 'inactive' && genre.statusGender === 'INACTIVE');
      
      return matchesSearch && matchesFilter;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  openCreateForm() {
    this.editingGenre = null;
    this.genreForm = {
      name: '',
      statusGender: 'ACTIVE',
      isActive: true
    };
    this.showForm = true;
  }

  openEditForm(genre: GenderExtended) {
    this.editingGenre = genre;
    this.genreForm = {
      name: genre.name,
      statusGender: genre.statusGender,
      isActive: genre.statusGender === 'ACTIVE'
    };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingGenre = null;
    this.genreForm = {
      name: '',
      statusGender: 'ACTIVE',
      isActive: true
    };
  }

  saveGenre() {
    console.log('Salvando gênero:', { isEdit: !!this.editingGenre, genreId: this.editingGenre?.id, formData: this.genreForm });

    if (!this.genreForm.name.trim()) {
      alert('Nome do gênero é obrigatório!');
      return;
    }

    this.isSaving = true;

    if (this.editingGenre) {
      // Editar gênero existente
      const updateData: GenderUpdateRequest = {
        name: this.genreForm.name.trim(),
        statusGender: this.genreForm.isActive ? 'ACTIVE' : 'INACTIVE'
      };

      console.log('Editando gênero existente com dados:', updateData);

      this.genderService.updateGender(this.editingGenre.id, updateData).subscribe({
        next: (savedGenre) => this.handleGenreSaveSuccess(savedGenre, true),
        error: (error) => this.handleGenreSaveError(error)
      });
    } else {
      // Criar novo gênero
      const createData: GenderCreateRequest = {
        name: this.genreForm.name.trim(),
        statusGender: this.genreForm.isActive ? 'ACTIVE' : 'INACTIVE'
      };

      console.log('Criando novo gênero com dados:', createData);

      this.genderService.createGender(createData).subscribe({
        next: (savedGenre) => this.handleGenreSaveSuccess(savedGenre, false),
        error: (error) => this.handleGenreSaveError(error)
      });
    }
  }

  private handleGenreSaveSuccess(savedGenre: Gender, isEdit: boolean) {
    console.log('Gênero salvo com sucesso:', savedGenre);
    
    if (isEdit) {
      // Atualizar gênero existente na lista local
      const index = this.genres.findIndex(g => g.id === this.editingGenre!.id);
      if (index !== -1) {
        this.genres[index] = {
          ...savedGenre,
          isActive: savedGenre.statusGender === 'ACTIVE',
          booksCount: this.genres[index].booksCount || 0,
          createdAt: this.genres[index].createdAt
        };
      }
    } else {
      // Adicionar novo gênero à lista
      this.genres.push({
        ...savedGenre,
        isActive: savedGenre.statusGender === 'ACTIVE',
        booksCount: 0,
        createdAt: new Date()
      });
    }

    this.applyFilters();
    this.closeForm();
    this.isSaving = false;

    const action = isEdit ? 'atualizado' : 'criado';
    alert(`Gênero ${action} com sucesso!`);
  }

  private handleGenreSaveError(error: any) {
    console.error('Erro ao salvar gênero:', error);
    this.isSaving = false;
    
    let errorMessage = 'Erro ao salvar gênero. Tente novamente.';
    
    if (error?.status === 409) {
      errorMessage = 'Já existe um gênero com este nome.';
    } else if (error?.status === 404) {
      errorMessage = 'Gênero não encontrado.';
    } else if (error?.status === 403) {
      errorMessage = 'Você não tem permissão para esta operação.';
    }
    
    alert(errorMessage);
  }

  toggleGenreStatus(genre: GenderExtended) {
    const newStatus = (genre.statusGender === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE';
    const action = genre.statusGender === 'ACTIVE' ? 'desativar' : 'ativar';
    
    if (confirm(`Deseja ${action} o gênero "${genre.name}"?`)) {
      const updateData: GenderUpdateRequest = {
        name: genre.name,
        statusGender: newStatus
      };

      this.genderService.updateGender(genre.id, updateData).subscribe({
        next: (updatedGenre) => {
          const index = this.genres.findIndex(g => g.id === genre.id);
          if (index !== -1) {
            this.genres[index] = {
              ...updatedGenre,
              isActive: updatedGenre.statusGender === 'ACTIVE',
              booksCount: this.genres[index].booksCount,
              createdAt: this.genres[index].createdAt
            };
            this.applyFilters();
          }
          
          const actionCompleted = newStatus === 'ACTIVE' ? 'ativado' : 'desativado';
          alert(`Gênero ${actionCompleted} com sucesso!`);
        },
        error: (error) => {
          console.error('Erro ao alterar status do gênero:', error);
          alert('Erro ao alterar status do gênero. Tente novamente.');
        }
      });
    }
  }

  confirmDelete(genre: GenderExtended) {
    if (genre.booksCount && genre.booksCount > 0) {
      alert(`Não é possível desativar o gênero "${genre.name}" pois existem ${genre.booksCount} livros associados a ele.`);
      return;
    }

    if (confirm(`Tem certeza que deseja desativar o gênero "${genre.name}"? Esta ação irá torná-lo inativo.`)) {
      this.deleteGenre(genre);
    }
  }

  deleteGenre(genre: GenderExtended) {
    this.genderService.deleteGender(genre.id).subscribe({
      next: (disabledGenre) => {
        // A API retorna o gênero desativado, então vamos atualizar na lista
        const index = this.genres.findIndex(g => g.id === genre.id);
        if (index !== -1) {
          this.genres[index] = {
            ...disabledGenre,
            isActive: disabledGenre.statusGender === 'ACTIVE',
            booksCount: this.genres[index].booksCount,
            createdAt: this.genres[index].createdAt
          };
          this.applyFilters();
        }
        alert('Gênero desativado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao desativar gênero:', error);
        
        let errorMessage = 'Erro ao desativar gênero. Tente novamente.';
        if (error?.status === 409) {
          errorMessage = 'Não é possível desativar o gênero pois existem livros associados a ele.';
        } else if (error?.status === 404) {
          errorMessage = 'Gênero não encontrado.';
        } else if (error?.status === 403) {
          errorMessage = 'Você não tem permissão para desativar gêneros.';
        }
        
        alert(errorMessage);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
