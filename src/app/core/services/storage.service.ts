import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Verifica se estamos no ambiente do browser
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Define um item no localStorage
   */
  setItem(key: string, value: string): void {
    if (this.isBrowser()) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error);
      }
    }
  }

  /**
   * Obtém um item do localStorage
   */
  getItem(key: string): string | null {
    if (this.isBrowser()) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('Erro ao ler do localStorage:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Remove um item do localStorage
   */
  removeItem(key: string): void {
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Erro ao remover do localStorage:', error);
      }
    }
  }

  /**
   * Limpa todo o localStorage
   */
  clear(): void {
    if (this.isBrowser()) {
      try {
        localStorage.clear();
      } catch (error) {
        console.warn('Erro ao limpar localStorage:', error);
      }
    }
  }

  /**
   * Verifica se uma chave existe no localStorage
   */
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * Define um objeto no localStorage (serializa como JSON)
   */
  setObject(key: string, value: any): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Erro ao serializar objeto para localStorage:', error);
    }
  }

  /**
   * Obtém um objeto do localStorage (deserializa do JSON)
   */
  getObject<T>(key: string): T | null {
    const item = this.getItem(key);
    if (item) {
      try {
        return JSON.parse(item) as T;
      } catch (error) {
        console.warn('Erro ao deserializar objeto do localStorage:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Define um item no sessionStorage
   */
  setSessionItem(key: string, value: string): void {
    if (this.isBrowser()) {
      try {
        sessionStorage.setItem(key, value);
      } catch (error) {
        console.warn('Erro ao salvar no sessionStorage:', error);
      }
    }
  }

  /**
   * Obtém um item do sessionStorage
   */
  getSessionItem(key: string): string | null {
    if (this.isBrowser()) {
      try {
        return sessionStorage.getItem(key);
      } catch (error) {
        console.warn('Erro ao ler do sessionStorage:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Remove um item do sessionStorage
   */
  removeSessionItem(key: string): void {
    if (this.isBrowser()) {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn('Erro ao remover do sessionStorage:', error);
      }
    }
  }
}
