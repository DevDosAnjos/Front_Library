import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  constructor(private storageService: StorageService) {
    console.log('MockAuthService: Construtor chamado');
  }

  /**
   * Login simulado simples sem dependências complexas
   */
  loginMock(username: string, password: string): Observable<User> {
    console.log('MockAuthService.loginMock: Método chamado com', username, password);
    
    return new Observable(observer => {
      setTimeout(() => {
        console.log('MockAuthService.loginMock: Processando login...');
        
        // Simular dados do usuário baseado nas credenciais
        const role = (username === 'admin' && password === 'admin123') ? 'ADMIN' : 'USER';
        const token = 'fake-jwt-token-' + Date.now();
        
        const user: User = {
          id: role === 'ADMIN' ? 1 : 2,
          username: username,
          role,
        };

        console.log('MockAuthService.loginMock: Usuário criado', user);

        // Salva token e dados do usuário
        this.storageService.setItem('authToken', token);
        this.storageService.setItem('userName', username);
        this.storageService.setItem('userRole', role);
        this.storageService.setObject('currentUser', user);
        
        console.log('MockAuthService.loginMock: Login concluído');
        observer.next(user);
        observer.complete();
      }, 2000);
    });
  }

  logout(): void {
    console.log('MockAuthService.logout: Executando logout');
    this.storageService.removeItem('authToken');
    this.storageService.removeItem('userName');
    this.storageService.removeItem('userRole');
    this.storageService.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    return !!this.storageService.getItem('authToken');
  }

  isAdmin(): boolean {
    return this.storageService.getItem('userRole') === 'ADMIN';
  }

  getCurrentUserData(): User | null {
    return this.storageService.getObject<User>('currentUser');
  }
}
