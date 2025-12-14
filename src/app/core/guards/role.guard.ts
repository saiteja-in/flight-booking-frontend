import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const storageService = inject(StorageService);
    const router = inject(Router);

    const user = storageService.getUser();
    
    if (user && user.roles && user.roles.some(role => allowedRoles.includes(role))) {
      return true;
    }

    router.navigate(['/home']);
    return false;
  };
};


