import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  
  // Skip adding token for public auth endpoints
  const isAuthEndpoint = req.url.includes('/api/v1.0/auth/');
  
  if (isAuthEndpoint) {
    return next(req);
  }

  // Get token from storage
  const token = storageService.getToken();
  
  if (token) {
    // Clone request and add Authorization header
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
