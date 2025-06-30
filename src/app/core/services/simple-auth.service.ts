import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SimpleAuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private storageService: StorageService) {
    console.log('SimpleAuthService: Construtor chamado - timestamp:', Date.now());
    console.log('SimpleAuthService: Estado atual do subject:', {
      currentUser: this.currentUserSubject.value,
      isLoggedIn: this.isLoggedInSubject.value
    });
    this.checkInitialAuthState();
  }

  /**
   * Verifica se há um token salvo e carrega o usuário
   */
  private checkInitialAuthState(): void {
    console.log('SimpleAuthService.checkInitialAuthState: Iniciando verificação');
    
    const token = this.storageService.getItem('authToken');
    const username = this.storageService.getItem('userName');
    const role = this.storageService.getItem('userRole') as 'ADMIN' | 'USER';
    
    console.log('SimpleAuthService.checkInitialAuthState: Dados do storage', { token, username, role });
    
    if (token && username && role) {
      const user: User = {
        id: role === 'ADMIN' ? 1 : 2,
        username: username,
        role: role
      };
      
      console.log('SimpleAuthService.checkInitialAuthState: Usuário encontrado, atualizando subjects');
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
      console.log('SimpleAuthService: Estado inicial carregado', user);
    } else {
      console.log('SimpleAuthService.checkInitialAuthState: Nenhum usuário autenticado encontrado');
      this.currentUserSubject.next(null);
      this.isLoggedInSubject.next(false);
    }
  }

  /**
   * Login simulado para desenvolvimento
   */
  loginMock(username: string, password: string): Observable<User> {
    console.log('SimpleAuthService.loginMock: Método chamado com', username, password);
    
    return new Observable(observer => {
      setTimeout(() => {
        console.log('SimpleAuthService.loginMock: Processando login...');
        
        // Simular dados do usuário baseado nas credenciais
        const isAdmin = (username === 'admin' || username === 'admin@elivro.com') && password === 'admin123';
        const role = isAdmin ? 'ADMIN' : 'USER';
        const token = 'fake-jwt-token-' + Date.now();
        
        const user: User = {
          id: role === 'ADMIN' ? 1 : 2,
          username: username,
          role,
        };

        console.log('SimpleAuthService.loginMock: Usuário criado', user);

        // Salva token e dados do usuário
        this.storageService.setItem('authToken', token);
        this.storageService.setItem('userName', username);
        this.storageService.setItem('userRole', role);
        this.storageService.setObject('currentUser', user);
        
        console.log('SimpleAuthService.loginMock: Dados salvos no storage');
        
        // Atualiza subjects
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
        
        console.log('SimpleAuthService.loginMock: Subjects atualizados', {
          currentUser: this.currentUserSubject.value,
          isLoggedIn: this.isLoggedInSubject.value
        });
        
        console.log('SimpleAuthService.loginMock: Login concluído');
        observer.next(user);
        observer.complete();
      }, 2000);
    });
  }

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    console.log('SimpleAuthService.logout: Executando logout');
    
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
   * Verifica se o usuário está logado
   */
  isAuthenticated(): boolean {
    const result = this.isLoggedInSubject.value && !!this.storageService.getItem('authToken');
    console.log('SimpleAuthService.isAuthenticated:', result, {
      subjectValue: this.isLoggedInSubject.value,
      token: !!this.storageService.getItem('authToken')
    });
    return result;
  }

  /**
   * Verifica se o usuário é admin
   */
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    const result = user?.role === 'ADMIN';
    console.log('SimpleAuthService.isAdmin:', result, {
      user: user,
      role: user?.role
    });
    return result;
  }

  /**
   * Obtém dados do usuário atual (do storage)
   */
  getCurrentUserData(): User | null {
    return this.storageService.getObject<User>('currentUser');
  }

  /**
   * Obtém o usuário atual (do subject)
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtém o nome do usuário
   */
  getUsername(): string {
    return this.currentUserSubject.value?.username || '';
  }
}
