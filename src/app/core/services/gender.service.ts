import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Gender, GenderFilters, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class GenderService {

  constructor(private apiService: ApiService) {}

  /**
   * Busca todos os gêneros
   */
  getGenders(filters?: GenderFilters): Observable<Gender[]> {
    const params = this.buildFilterParams(filters);
    return this.apiService.get<ApiResponse<Gender[]>>('genders', params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Busca apenas gêneros ativos
   */
  getActiveGenders(): Observable<Gender[]> {
    return this.getGenders({ status_gender: 'ACTIVE' });
  }

  /**
   * Busca um gênero específico por ID
   */
  getGenderById(id: number): Observable<Gender> {
    return this.apiService.get<ApiResponse<Gender>>(`genders/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Cria um novo gênero (ADMIN apenas)
   */
  createGender(gender: Omit<Gender, 'id'>): Observable<Gender> {
    return this.apiService.post<ApiResponse<Gender>>('genders', gender).pipe(
      map(response => response.data)
    );
  }

  /**
   * Atualiza um gênero (ADMIN apenas)
   */
  updateGender(id: number, gender: Partial<Omit<Gender, 'id'>>): Observable<Gender> {
    return this.apiService.put<ApiResponse<Gender>>(`genders/${id}`, gender).pipe(
      map(response => response.data)
    );
  }

  /**
   * Ativa/desativa um gênero (ADMIN apenas)
   */
  toggleGenderStatus(id: number): Observable<Gender> {
    return this.apiService.patch<ApiResponse<Gender>>(`genders/${id}/toggle-status`, {}).pipe(
      map(response => response.data)
    );
  }

  /**
   * Deleta um gênero (ADMIN apenas)
   */
  deleteGender(id: number): Observable<void> {
    return this.apiService.delete<void>(`genders/${id}`);
  }

  /**
   * Busca estatísticas de livros por gênero
   */
  getGenderStats(): Observable<{gender: Gender, bookCount: number, inStockCount: number}[]> {
    return this.apiService.get<ApiResponse<any[]>>('genders/stats').pipe(
      map(response => response.data)
    );
  }

  /**
   * Constrói parâmetros de filtro para a API
   */
  private buildFilterParams(filters?: GenderFilters): any {
    if (!filters) return {};

    const params: any = {};

    if (filters.status_gender) params.status_gender = filters.status_gender;
    if (filters.search) params.search = filters.search;

    return params;
  }
}
