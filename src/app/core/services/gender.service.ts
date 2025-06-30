import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  Gender,
  GenderFilters,
  GenderCreateRequest,
  GenderUpdateRequest,
  GenderResponse
} from '../models/api-models';

@Injectable({
  providedIn: 'root'
})
export class GenderService {

  constructor(
    private apiService: ApiService
  ) {}

  /**
   * Busca gêneros públicos
   * Alinhado com backend: GET /api/gender (permitAll)
   */
  getGenders(filters?: GenderFilters): Observable<Gender[]> {
    return this.apiService.get<GenderResponse[]>('gender').pipe(
      map(genders => genders.map(gender => this.mapGenderResponseToGender(gender)))
    );
  }

  /**
   * Busca todos os gêneros (usuários autenticados)
   * Alinhado com backend: GET /api/gender/all (authenticated)
   */
  getAllGenders(): Observable<Gender[]> {
    return this.apiService.get<GenderResponse[]>('gender/all').pipe(
      map(genders => genders.map(gender => this.mapGenderResponseToGender(gender)))
    );
  }

  /**
   * Busca gêneros ativos (usuários autenticados)
   * Alinhado com backend: GET /api/gender/active (authenticated)
   */
  getActiveGenders(): Observable<Gender[]> {
    return this.apiService.get<GenderResponse[]>('gender/active').pipe(
      map(genders => genders.map(gender => this.mapGenderResponseToGender(gender)))
    );
  }

  /**
   * Busca gêneros inativos (apenas admin)
   * Alinhado com backend: GET /api/gender/inactive (hasRole ADMIN)
   */
  getInactiveGenders(): Observable<Gender[]> {
    return this.apiService.get<GenderResponse[]>('gender/inactive').pipe(
      map(genders => genders.map(gender => this.mapGenderResponseToGender(gender)))
    );
  }

  /**
   * Cria um novo gênero (ADMIN apenas)
   * Alinhado com backend: POST /api/gender (hasRole ADMIN)
   */
  createGender(genderData: GenderCreateRequest): Observable<Gender> {
    return this.apiService.post<GenderResponse>('gender', genderData).pipe(
      map(gender => this.mapGenderResponseToGender(gender))
    );
  }

  /**
   * Atualiza um gênero (ADMIN apenas)
   * Alinhado com backend: PUT /api/gender/{id} (hasRole ADMIN)
   */
  updateGender(id: number, genderData: GenderUpdateRequest): Observable<Gender> {
    return this.apiService.put<GenderResponse>(`gender/${id}`, genderData).pipe(
      map(gender => this.mapGenderResponseToGender(gender))
    );
  }

  /**
   * Deleta um gênero (ADMIN apenas)
   * Alinhado com backend: DELETE /api/gender/{id} (hasRole ADMIN)
   */
  deleteGender(id: number): Observable<boolean> {
    return this.apiService.delete(`gender/${id}`).pipe(
      map(() => true)
    );
  }

  /**
   * Mapeia GenderResponse do backend para Gender do frontend
   */
  private mapGenderResponseToGender(genderResponse: GenderResponse): Gender {
    return {
      id: parseInt(genderResponse.id),
      name: genderResponse.name,
      statusGender: genderResponse.statusGender
    };
  }
}
