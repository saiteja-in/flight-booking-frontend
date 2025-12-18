import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';

// Public endpoints that don't require authentication
// These endpoints don't need token validation, but still send withCredentials
// because backend CORS is configured with allowCredentials: true
const PUBLIC_ENDPOINTS = [
  '/api/v1.0/auth/',
  '/api/v1.0/flight/admin/search',
  '/api/v1.0/flight/admin/internal/',
  '/health',
  '/oauth2/',
  '/login/oauth2/',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  // Check if this is a public endpoint
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint =>
    req.url.includes(endpoint)
  );

  // Add withCredentials to ALL requests because backend CORS requires it
  // Backend has allowCredentials: true globally, so we must send credentials
  // even for public endpoints (they just won't have a token, which is fine)
  req = req.clone({
    withCredentials: true
  });

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors globally (only for authenticated endpoints)
      // Public endpoints can return 401 without triggering logout
      if (error.status === 401 && !isPublicEndpoint) {
        // Clear localStorage as token is invalid or missing
        storageService.clean();

        // Only redirect if not already on login page to avoid redirect loops
        if (!router.url.startsWith('/login')) {
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url }
          });
        }
      }

      // Re-throw the error so components can handle it if needed
      return throwError(() => error);
    })
  );
};
