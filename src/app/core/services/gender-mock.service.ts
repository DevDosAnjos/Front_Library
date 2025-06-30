import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Gender } from '../models';

@Injectable({
  providedIn: 'root'
})
export class GenderService {

  // Dados mocados dos 12 gêneros reais do backend
  private mockGenders: Gender[] = [
    { id: 1, name: 'Ficção Científica', status_gender: 'ACTIVE' },
    { id: 2, name: 'Fantasia', status_gender: 'ACTIVE' },
    { id: 3, name: 'Suspense e Mistério', status_gender: 'ACTIVE' },
    { id: 4, name: 'Romance', status_gender: 'ACTIVE' },
    { id: 5, name: 'Literatura Clássica', status_gender: 'ACTIVE' },
    { id: 6, name: 'Biografias e Memórias', status_gender: 'ACTIVE' },
    { id: 7, name: 'História', status_gender: 'ACTIVE' },
    { id: 8, name: 'Tecnologia e Ciência', status_gender: 'ACTIVE' },
    { id: 9, name: 'Mangás e HQs', status_gender: 'INACTIVE' },
    { id: 10, name: 'Autoajuda', status_gender: 'ACTIVE' },
    { id: 11, name: 'Infantojuvenil', status_gender: 'ACTIVE' },
    { id: 12, name: 'Gastronomia', status_gender: 'ACTIVE' }
  ];

  /**
   * Busca todos os gêneros
   */
  getGenders(): Observable<Gender[]> {
    return of(this.mockGenders).pipe(delay(300));
  }

  /**
   * Busca apenas gêneros ativos
   */
  getActiveGenders(): Observable<Gender[]> {
    const activeGenders = this.mockGenders.filter(g => g.status_gender === 'ACTIVE');
    return of(activeGenders).pipe(delay(300));
  }

  /**
   * Busca um gênero específico por ID
   */
  getGenderById(id: number): Observable<Gender | undefined> {
    const gender = this.mockGenders.find(g => g.id === id);
    return of(gender).pipe(delay(200));
  }

  /**
   * Estatísticas dos gêneros (será implementado quando necessário)
   */
  getGenderStats(): Observable<any[]> {
    return of([]).pipe(delay(300));
  }
}
