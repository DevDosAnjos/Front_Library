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
   * Busca todos os gêneros (ativos e inativos)
   * Alinhado com backend: GET /api/gender/all (permitAll)
   */
  getAllGenders(): Observable<Gender[]> {
    console.log('=== GENDER SERVICE: Fazendo requisição para gender/all ===');
    return this.apiService.get<GenderResponse[]>('gender/all').pipe(
      map(response => {
        console.log('=== GENDER SERVICE: Resposta bruta da API ===', response);
        
        if (!response || !Array.isArray(response)) {
          console.warn('=== GENDER SERVICE: Resposta inválida ===', response);
          return [];
        }
        
        const mappedGenders = response.map((gender: GenderResponse) => {
          console.log('=== GENDER SERVICE: Mapeando gênero individual ===', gender);
          const mapped = this.mapGenderResponseToGender(gender);
          console.log('=== GENDER SERVICE: Gênero mapeado ===', mapped);
          return mapped;
        });
        
        console.log('=== GENDER SERVICE: Todos gêneros mapeados ===', mappedGenders);
        return mappedGenders;
      })
    );
  }

  /**
   * Busca gênero por ID
   * Alinhado com backend: GET /api/gender/{id} (permitAll)
   */
  getGenderById(id: number): Observable<Gender> {
    console.log(`=== GENDER SERVICE: Fazendo requisição para gender/${id} ===`);
    return this.apiService.get<GenderResponse>(`gender/${id}`).pipe(
      map(response => {
        console.log('=== GENDER SERVICE: Gênero por ID recebido ===', response);
        return this.mapGenderResponseToGender(response);
      })
    );
  }

  /**
   * Busca gêneros ativos (permitAll)
   * Alinhado com backend: GET /api/gender/active (permitAll)
   */
  getActiveGenders(): Observable<Gender[]> {
    console.log('=== GENDER SERVICE: Fazendo requisição para gender/active ===');
    return this.apiService.get<GenderResponse[]>('gender/active').pipe(
      map(genders => {
        console.log('=== GENDER SERVICE: Gêneros ativos recebidos ===', genders);
        return genders.map(gender => this.mapGenderResponseToGender(gender));
      })
    );
  }

  /**
   * Busca gêneros inativos (apenas ADMIN)
   * Alinhado com backend: GET /api/gender/inactive (hasRole ADMIN)
   */
  getInactiveGenders(): Observable<Gender[]> {
    console.log('=== GENDER SERVICE: Fazendo requisição para gender/inactive ===');
    return this.apiService.get<GenderResponse[]>('gender/inactive').pipe(
      map(genders => {
        console.log('=== GENDER SERVICE: Gêneros inativos recebidos ===', genders);
        return genders.map(gender => this.mapGenderResponseToGender(gender));
      })
    );
  }

  /**
   * Cria um novo gênero (ADMIN apenas)
   * Alinhado com backend: POST /api/gender (hasRole ADMIN)
   * Backend retorna Gender entity, não GenderResponse
   */
  createGender(genderData: GenderCreateRequest): Observable<Gender> {
    return this.apiService.post<any>('gender', genderData).pipe(
      map(response => {
        console.log('=== GENDER SERVICE: Gênero criado ===', response);
        // O backend retorna Gender entity diretamente
        return {
          id: typeof response.id === 'string' ? parseInt(response.id) : response.id,
          name: response.name,
          statusGender: response.statusGender || 'ACTIVE'
        };
      })
    );
  }

  /**
   * Atualiza um gênero (ADMIN apenas)
   * Alinhado com backend: PUT /api/gender/{id} (hasRole ADMIN)
   * Backend retorna Gender entity, não GenderResponse
   */
  updateGender(id: number, genderData: GenderUpdateRequest): Observable<Gender> {
    return this.apiService.put<any>(`gender/${id}`, genderData).pipe(
      map(response => {
        console.log('=== GENDER SERVICE: Gênero atualizado ===', response);
        // O backend retorna Gender entity diretamente
        return {
          id: typeof response.id === 'string' ? parseInt(response.id) : response.id,
          name: response.name,
          statusGender: response.statusGender || 'ACTIVE'
        };
      })
    );
  }

  /**
   * Deleta um gênero (ADMIN apenas) - Na verdade desativa o gênero
   * Alinhado com backend: DELETE /api/gender/{id} (hasRole ADMIN)
   * Backend retorna Gender entity com status INACTIVE
   */
  deleteGender(id: number): Observable<Gender> {
    console.log(`=== GENDER SERVICE: Desativando gênero ID ${id} ===`);
    return this.apiService.delete<any>(`gender/${id}`).pipe(
      map(response => {
        console.log('=== GENDER SERVICE: Gênero desativado ===', response);
        // O backend retorna Gender entity com statusGender=INACTIVE
        return {
          id: typeof response.id === 'string' ? parseInt(response.id) : response.id,
          name: response.name,
          statusGender: response.statusGender || 'INACTIVE'
        };
      })
    );
  }

  /**
   * Mapeia GenderResponse do backend para Gender do frontend
   */
  private mapGenderResponseToGender(genderResponse: GenderResponse): Gender {
    console.log('=== MAPEAMENTO: Input ===', genderResponse);
    
    // Tentar diferentes formatos de campo de status
    const status = genderResponse.statusGender || 
                   genderResponse.status_gender || 
                   (genderResponse as any).status || 
                   'ACTIVE';
    
    console.log('=== MAPEAMENTO: Status detectado ===', status);
    
    const mapped = {
      id: typeof genderResponse.id === 'string' ? parseInt(genderResponse.id) : genderResponse.id,
      name: genderResponse.name,
      statusGender: status as 'INACTIVE' | 'ACTIVE'
    };
    
    console.log('=== MAPEAMENTO: Output ===', mapped);
    return mapped;
  }
}
