import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';

interface Genre {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  booksCount?: number;
}

@Component({
  selector: 'app-genres-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './genres-management.component.html',
  styleUrl: './genres-management.component.css'
})
export class GenresManagementComponent implements OnInit {
  genres: Genre[] = [];
  filteredGenres: Genre[] = [];
  
  // Form states
  showForm = false;
  editingGenre: Genre | null = null;
  isLoading = true;
  isSaving = false;
  
  // Form data
  genreForm = {
    name: '',
    description: '',
    isActive: true
  };
  
  // Filters and search
  searchTerm = '';
  filterActive = 'all'; // 'all', 'active', 'inactive'

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.checkAdminAuth();
    this.loadGenres();
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

  loadGenres() {
    this.isLoading = true;
    
    // Simular dados de gêneros
    setTimeout(() => {
      this.genres = [
        {
          id: 1,
          name: 'Romance',
          description: 'Histórias de amor e relacionamentos',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          booksCount: 25
        },
        {
          id: 2,
          name: 'Ficção Científica',
          description: 'Histórias futuristas e tecnológicas',
          isActive: true,
          createdAt: new Date('2024-01-16'),
          booksCount: 18
        },
        {
          id: 3,
          name: 'Mistério',
          description: 'Histórias de suspense e investigação',
          isActive: true,
          createdAt: new Date('2024-01-17'),
          booksCount: 12
        },
        {
          id: 4,
          name: 'Fantasia',
          description: 'Mundos mágicos e criaturas míticas',
          isActive: true,
          createdAt: new Date('2024-01-18'),
          booksCount: 22
        },
        {
          id: 5,
          name: 'Terror',
          description: 'Histórias de horror e suspense',
          isActive: false,
          createdAt: new Date('2024-01-19'),
          booksCount: 8
        }
      ];
      
      this.applyFilters();
      this.isLoading = false;
    }, 800);
  }

  applyFilters() {
    this.filteredGenres = this.genres.filter(genre => {
      const matchesSearch = genre.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           genre.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesFilter = this.filterActive === 'all' || 
                           (this.filterActive === 'active' && genre.isActive) ||
                           (this.filterActive === 'inactive' && !genre.isActive);
      
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
      description: '',
      isActive: true
    };
    this.showForm = true;
  }

  openEditForm(genre: Genre) {
    this.editingGenre = genre;
    this.genreForm = {
      name: genre.name,
      description: genre.description,
      isActive: genre.isActive
    };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingGenre = null;
    this.genreForm = {
      name: '',
      description: '',
      isActive: true
    };
  }

  saveGenre() {
    if (!this.genreForm.name.trim()) {
      alert('Nome do gênero é obrigatório!');
      return;
    }

    this.isSaving = true;

    setTimeout(() => {
      if (this.editingGenre) {
        // Editar gênero existente
        const index = this.genres.findIndex(g => g.id === this.editingGenre!.id);
        if (index !== -1) {
          this.genres[index] = {
            ...this.genres[index],
            name: this.genreForm.name.trim(),
            description: this.genreForm.description.trim(),
            isActive: this.genreForm.isActive
          };
        }
      } else {
        // Criar novo gênero
        const newGenre: Genre = {
          id: Math.max(...this.genres.map(g => g.id)) + 1,
          name: this.genreForm.name.trim(),
          description: this.genreForm.description.trim(),
          isActive: this.genreForm.isActive,
          createdAt: new Date(),
          booksCount: 0
        };
        this.genres.push(newGenre);
      }

      this.applyFilters();
      this.closeForm();
      this.isSaving = false;
    }, 1000);
  }

  toggleGenreStatus(genre: Genre) {
    if (confirm(`Deseja ${genre.isActive ? 'desativar' : 'ativar'} o gênero "${genre.name}"?`)) {
      genre.isActive = !genre.isActive;
      this.applyFilters();
    }
  }

  deleteGenre(genre: Genre) {
    if (genre.booksCount && genre.booksCount > 0) {
      alert(`Não é possível excluir o gênero "${genre.name}" pois existem ${genre.booksCount} livros vinculados a ele.`);
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o gênero "${genre.name}"? Esta ação não pode ser desfeita.`)) {
      this.genres = this.genres.filter(g => g.id !== genre.id);
      this.applyFilters();
    }
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
