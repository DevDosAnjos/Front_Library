import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { User, LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) {
    this.checkInitialAuthState();
  }

  /**
   * Verifica se há um token salvo e valida o usuário
   */
  private checkInitialAuthState(): void {
    const token = this.storageService.getItem('authToken');
    if (token) {
      this.getCurrentUser().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.isLoggedInSubject.next(true);
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  /**
   * Realiza login do usuário
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<ApiResponse<LoginResponse>>('auth/login', credentials).pipe(
      map(response => {
        const loginData = response.data;
        
        // Salva token e dados do usuário
        this.storageService.setItem('authToken', loginData.token);
        this.storageService.setObject('currentUser', loginData.user);
        
        // Atualiza subjects
        this.currentUserSubject.next(loginData.user);
        this.isLoggedInSubject.next(true);
        
        return loginData;
      })
    );
  }

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    // Remove dados do storage
    this.storageService.removeItem('authToken');
    this.storageService.removeItem('currentUser');
    
    // Limpa subjects
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  /**
   * Registra novo usuário
   */
  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.apiService.post<ApiResponse<LoginResponse>>('auth/register', userData).pipe(
      map(response => {
        const loginData = response.data;
        
        // Salva token e dados do usuário após registro
        this.storageService.setItem('authToken', loginData.token);
        this.storageService.setObject('currentUser', loginData.user);
        
        // Atualiza subjects
        this.currentUserSubject.next(loginData.user);
        this.isLoggedInSubject.next(true);
        
        return loginData;
      })
    );
  }

  /**
   * Busca dados do usuário atual
   */
  getCurrentUser(): Observable<User> {
    return this.apiService.get<ApiResponse<User>>('auth/me').pipe(
      map(response => response.data)
    );
  }

  /**
   * Atualiza perfil do usuário
   */
  updateProfile(userData: Partial<Omit<User, 'id' | 'role'>>): Observable<User> {
    return this.apiService.put<ApiResponse<User>>('auth/profile', userData).pipe(
      map(response => {
        const updatedUser = response.data;
        
        // Atualiza storage e subject
        this.storageService.setObject('currentUser', updatedUser);
        this.currentUserSubject.next(updatedUser);
        
        return updatedUser;
      })
    );
  }

  /**
   * Altera senha do usuário
   */
  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.apiService.post<void>('auth/change-password', {
      oldPassword,
      newPassword
    });
  }

  /**
   * Verifica se o usuário está logado
   */
  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value && !!this.storageService.getItem('authToken');
  }

  /**
   * Verifica se o usuário é admin
   */
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'ADMIN';
  }

  /**
   * Obtém o token de autenticação
   */
  getAuthToken(): string | null {
    return this.storageService.getItem('authToken');
  }

  /**
   * Obtém dados do usuário atual (do storage)
   */
  getCurrentUserData(): User | null {
    return this.storageService.getObject<User>('currentUser');
  }

  /**
   * Verifica se o token está válido (não expirado)
   */
  isTokenValid(): Observable<boolean> {
    return this.apiService.get<ApiResponse<{valid: boolean}>>('auth/validate-token').pipe(
      map(response => response.data.valid)
    );
  }

  /**
   * Refresh token (se implementado no backend)
   */
  refreshToken(): Observable<{token: string}> {
    return this.apiService.post<ApiResponse<{token: string}>>('auth/refresh', {}).pipe(
      map(response => {
        const newToken = response.data.token;
        this.storageService.setItem('authToken', newToken);
        return response.data;
      })
    );
  }
}
