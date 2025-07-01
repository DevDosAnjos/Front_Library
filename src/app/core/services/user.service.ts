import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { 
  User, 
  UserFilters, 
  UserCreateRequest, 
  UserUpdateRequest, 
  UserResponse 
} from '../models/api-models';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private apiService: ApiService
  ) {}

  /**
   * Busca todos os usuários (ADMIN apenas)
   * Alinhado com backend: GET /api/user/all (hasRole ADMIN conforme SecurityConfig)
   */
  getAllUsers(filters?: UserFilters): Observable<User[]> {
    let params: any = {};

    console.log('🔄 UserService.getAllUsers() - Iniciando busca de usuários...');

    if (filters) {
      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.role) {
        params.role = filters.role;
      }
      if (filters.isActive !== undefined) {
        params.isActive = filters.isActive;
      }
      console.log('📋 Filtros de usuário aplicados:', params);
    }

    return this.apiService.get<UserResponse[]>('user/all', params).pipe(
      map(users => {
        console.log(`✅ UserService: Recebidos ${users.length} usuários do backend`);
        const mappedUsers = users.map(user => this.mapUserResponseToUser(user));
        console.log('📝 Usuários mapeados:', mappedUsers.slice(0, 2)); // Log apenas os 2 primeiros
        return mappedUsers;
      }),
      catchError((error: any) => {
        console.error('❌ UserService.getAllUsers() - Erro na API:', error);
        console.error('🔍 Detalhes do erro:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        throw error; // Re-throw para que o dashboard possa capturar
      })
    );
  }

  /**
   * Busca usuários ativos (ADMIN apenas)
   * Alinhado com backend: GET /api/user/active (hasRole ADMIN)
   */
  getActiveUsers(): Observable<User[]> {
    return this.apiService.get<UserResponse[]>('user/active').pipe(
      map(users => users.map(user => this.mapUserResponseToUser(user)))
    );
  }

  /**
   * Cria um novo usuário (ADMIN apenas)
   * Usa o endpoint de registro com privilégios de admin
   */
  createUser(userData: UserCreateRequest): Observable<User> {
    // Usar endpoint de criação de usuário admin ou registro
    const createData = {
      username: userData.username,
      password: userData.password,
      fullName: userData.fullName
    };
    
    // Se o backend tiver um endpoint específico para admin criar usuários
    // usar 'admin/user' ou 'user/create', caso contrário usar 'auth/register'
    return this.apiService.post<UserResponse>('auth/register', createData).pipe(
      map(response => {
        // O registro retorna apenas username, então criamos um User básico
        const newUser: User = {
          id: 0, // ID será definido quando recarregar a lista
          username: response.username || userData.username,
          role: 'USER', // Usuário criado sempre como USER primeiro
          fullName: userData.fullName,
          isActive: true,
          createdAt: new Date()
        };
        return newUser;
      })
    );
  }

  /**
   * Método temporário para criar usuário - teste de cache
   */
  createUserAdmin(userData: UserCreateRequest): Observable<User> {
    console.log('=== TESTE CACHE: Usando createUserAdmin ===');
    console.log('Dados recebidos:', userData);
    
    const createData = {
      username: userData.username,
      password: userData.password,
      fullName: userData.fullName
    };
    
    console.log('Fazendo POST para auth/register com dados:', createData);
    
    return this.apiService.post<UserResponse>('auth/register', createData).pipe(
      map(response => {
        console.log('Resposta do auth/register:', response);
        const newUser: User = {
          id: 0,
          username: response.username || userData.username,
          role: 'USER',
          fullName: userData.fullName,
          isActive: true,
          createdAt: new Date()
        };
        return newUser;
      })
    );
  }

  /**
   * Atualiza um usuário (ADMIN apenas)
   * Alinhado com backend: PUT /api/user/{id} (hasRole ADMIN)
   */
  updateUser(id: number, userData: UserUpdateRequest): Observable<User> {
    return this.apiService.put<UserResponse>(`user/${id}`, userData).pipe(
      map(user => this.mapUserResponseToUser(user))
    );
  }

  /**
   * Deleta um usuário (ADMIN apenas)
   * Alinhado com backend: DELETE /api/user/{id} (hasRole ADMIN)
   */
  deleteUser(id: number): Observable<boolean> {
    return this.apiService.delete(`user/${id}`).pipe(
      map(() => true)
    );
  }

  /**
   * Busca estatísticas de usuários (ADMIN apenas)
   */
  getUserStats(): Observable<{totalUsers: number, activeUsers: number, adminUsers: number}> {
    return this.apiService.get<any>('user/stats').pipe(
      map(stats => ({
        totalUsers: stats.totalUsers || 0,
        activeUsers: stats.activeUsers || 0,
        adminUsers: stats.adminUsers || 0
      }))
    );
  }

  /**
   * Mapeia UserResponse do backend para User do frontend
   */
  private mapUserResponseToUser(userResponse: UserResponse): User {
    return {
      id: typeof userResponse.id === 'string' ? parseInt(userResponse.id) : userResponse.id,
      username: userResponse.username,
      email: userResponse.email || '',
      fullName: userResponse.fullName || userResponse.username,
      role: userResponse.userRole as 'USER' | 'ADMIN',
      isActive: userResponse.isActive !== false,
      createdAt: userResponse.createdAt ? new Date(userResponse.createdAt) : new Date(),
      lastLogin: userResponse.lastLogin ? new Date(userResponse.lastLogin) : undefined
    };
  }
}
