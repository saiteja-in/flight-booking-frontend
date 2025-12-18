import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Fast check: if no user data in localStorage, redirect immediately
  if (!storageService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Validate token with backend to ensure cookie exists and is valid
  return authService.validateToken().pipe(
    map((isValid) => {
      if (isValid) {
        return true;
      } else {
        // Token invalid or missing - clear storage and redirect
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    }),
    catchError(() => {
      // Error validating token - clear storage and redirect
      storageService.clean();
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    })
  );
};


