import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  
  /**
   * URL base da API
   */
  get apiUrl(): string {
    return environment.apiUrl;
  }

  /**
   * Verifica se está em modo de produção
   */
  get isProduction(): boolean {
    return environment.production;
  }
}
