import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Injeta o StorageService que tem proteção para SSR
  const storageService = inject(StorageService);
  
  // Obtém o token usando o StorageService (seguro para SSR)
  const token = storageService.getItem('authToken');

  // Se existe token, adiciona no header
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  // Se não tem token, envia a requisição original
  return next(req);
};
