/**
 * Registry para garantir instâncias singleton dos serviços principais
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceRegistry {
  private static instances = new Map<string, any>();
  
  static getInstance<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
      console.log(`ServiceRegistry: Criando nova instância para ${key}`);
    }
    return this.instances.get(key);
  }
  
  static hasInstance(key: string): boolean {
    return this.instances.has(key);
  }
  
  static clearInstance(key: string): void {
    this.instances.delete(key);
  }
  
  static clearAll(): void {
    this.instances.clear();
  }
}
