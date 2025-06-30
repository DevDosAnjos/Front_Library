import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { User, LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable().pipe(
    distinctUntilChanged((prev, curr) => prev?.username === curr?.username),
    shareReplay(1)
  );

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

  private initialized = false;

  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) {
    if (!this.initialized) {
      console.log('AuthService: Construtor chamado');
      this.initialized = true;
      this.checkInitialAuthState();
    }
  }

  /**
   * Verifica se há um token salvo e valida o usuário
   */
  private checkInitialAuthState(): void {
    const token = this.storageService.getItem('authToken');
    const username = this.storageService.getItem('userName');
    const role = this.storageService.getItem('userRole') as 'ADMIN' | 'USER';
    
    if (token && username && role) {
      // Criar objeto user a partir dos dados do storage
      const user: User = {
        id: role === 'ADMIN' ? 1 : 2,
        username: username,
        role: role
      };
      
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
    }
  }

  /**
   * Realiza login do usuário
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('AuthService.login: Tentando login com backend para:', credentials.username);
    
    return this.apiService.post<any>('auth/login', credentials).pipe(
      map(response => {
        console.log('AuthService.login: Response completa do backend:', response);
        console.log('AuthService.login: Tipo da response:', typeof response);
        console.log('AuthService.login: Keys da response:', Object.keys(response || {}));
        
        let token: string;
        let user: User;
        
        // Verificar diferentes estruturas de resposta do backend
        if (response && response.token && typeof response.token === 'string') {
          // Caso mais simples: backend retorna apenas { token: "..." }
          console.log('AuthService.login: Backend retornou apenas token');
          token = response.token;
          
          // Criar um usuário baseado nas credenciais fornecidas
          user = {
            id: credentials.username.toLowerCase() === 'admin' ? 1 : 2,
            username: credentials.username,
            role: credentials.username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER'
          };
          console.log('AuthService.login: Usuario criado com base no username:', user);
          
        } else if (response && response.access_token && typeof response.access_token === 'string') {
          // Caso o backend use access_token ao invés de token
          console.log('AuthService.login: Backend retornou access_token');
          token = response.access_token;
          
          user = {
            id: credentials.username.toLowerCase() === 'admin' ? 1 : 2,
            username: credentials.username,
            role: credentials.username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER'
          };
          
        } else if (response && response.success && response.data && response.data.token) {
          // Estrutura: { success: true, data: { token, user? } }
          console.log('AuthService.login: Usando estrutura ApiResponse');
          token = response.data.token;
          
          if (response.data.user) {
            user = response.data.user;
          } else {
            user = {
              id: credentials.username.toLowerCase() === 'admin' ? 1 : 2,
              username: credentials.username,
              role: credentials.username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER'
            };
          }
          
        } else if (response && response.token && response.user) {
          // Estrutura completa: { token, user }
          console.log('AuthService.login: Estrutura completa com token e user');
          token = response.token;
          user = response.user;
          
        } else {
          console.error('AuthService.login: Estrutura de response não reconhecida:', response);
          throw new Error('Backend não retornou token válido');
        }
        
        console.log('AuthService.login: Token extraído:', token);
        console.log('AuthService.login: Usuario final:', user);
        
        // Salva token e dados do usuário
        this.storageService.setItem('authToken', token);
        this.storageService.setItem('userName', user.username);
        this.storageService.setItem('userRole', user.role);
        this.storageService.setObject('currentUser', user);
        
        // Atualiza subjects
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
        
        console.log('AuthService.login: Login realizado com sucesso');
        console.log('AuthService.login: Token salvo no storage');
        console.log('AuthService.login: Usuario atual:', user);
        
        // Retorna no formato esperado pelo frontend
        const loginData: LoginResponse = {
          token: token,
          user: user
        };
        
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
    this.storageService.removeItem('userName');
    this.storageService.removeItem('userRole');
    this.storageService.removeItem('currentUser');
    
    // Limpa subjects
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  /**
   * Registra novo usuário - SEMPRE redireciona para login
   */
  register(userData: RegisterRequest): Observable<{success: boolean, message: string, username: string, requiresLogin: boolean}> {
    console.log('AuthService.register: Tentando registrar usuário:', userData.username);
    console.log('AuthService.register: Dados enviados:', userData);
    
    return this.apiService.post<any>('auth/register', userData).pipe(
      map(response => {
        console.log('AuthService.register: Response completa do backend:', response);
        console.log('AuthService.register: Tipo da response:', typeof response);
        console.log('AuthService.register: Keys da response:', Object.keys(response || {}));
        
        // Para sua API que sempre retorna apenas o username do usuário criado
        if (response && response.username && typeof response.username === 'string') {
          console.log('AuthService.register: Backend retornou username do usuário criado:', response.username);
          console.log('AuthService.register: Registro bem-sucedido - sempre redireciona para login');
          
          // Retorna objeto indicando sucesso sem token (sempre redireciona para login)
          const registrationResult = {
            success: true,
            message: 'Usuário registrado com sucesso! Redirecionando para login...',
            username: response.username,
            requiresLogin: true
          };
          
          console.log('AuthService.register: Retornando resultado de registro:', registrationResult);
          return registrationResult;
          
        } else {
          console.error('AuthService.register: Estrutura de response não reconhecida:', response);
          throw new Error('Backend não retornou resposta válida para registro');
        }
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