import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', error);

      // Tratar diferentes tipos de erro
      switch (error.status) {
        case 401:
          // Token inválido ou expirado - redirecionar para login
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          router.navigate(['/auth/login'], { 
            queryParams: { message: 'Sessão expirada. Faça login novamente.' }
          });
          break;
        
        case 403:
          // Sem permissão
          console.error('Acesso negado');
          break;
        
        case 404:
          // Recurso não encontrado
          console.error('Recurso não encontrado');
          break;
        
        case 500:
          // Erro interno do servidor
          console.error('Erro interno do servidor');
          break;
        
        default:
          // Outros erros
          console.error('Erro inesperado:', error.message);
      }

      return throwError(() => error);
    })
  );
};
