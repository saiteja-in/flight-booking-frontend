import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { StorageService } from './storage.service';
import { JwtResponse } from '../models/jwt-response.model';

const AUTH_API = 'http://localhost:8765/api/v1.0/auth';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);

  login(username: string, password: string): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(
      AUTH_API + '/signin',
      {
        username,
        password,
      },
      {
        ...httpOptions,
        withCredentials: true // Include cookies (JWT token)
      }
    ).pipe(
      map((response: JwtResponse) => {
        // Store user and token separately
        this.storageService.saveUserAndToken(response);
        return response;
      })
    );
  }

  register(username: string, email: string, password: string, roles?: Set<string>): Observable<any> {
    const body: any = {
      username,
      email,
      password,
    };

    // Add roles if provided
    if (roles && roles.size > 0) {
      body.role = Array.from(roles);
    }

    return this.http.post(
      AUTH_API + '/signup',
      body,
      {
        ...httpOptions,
        withCredentials: true // Include cookies for consistency
      }
    );
  }

  logout(): Observable<any> {
    return this.http.post(AUTH_API + '/signout', {}, httpOptions);
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<{ message: string; status?: string }> {
    return this.http.post<{ message: string; status?: string }>(
      AUTH_API + '/change-password',
      { currentPassword, newPassword, confirmPassword },
      {
        ...httpOptions,
        withCredentials: true,
      }
    );
  }

  validateToken(): Observable<boolean> {
    return this.http.get<{ message: string }>(AUTH_API + '/validate', {
      ...httpOptions,
      withCredentials: true
    }).pipe(
      map(() => true),
      catchError(() => {
        // Token is invalid or missing
        this.storageService.clean();
        return of(false);
      })
    );
  }

  loginWithGoogle(idToken: string): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(
      AUTH_API + '/oauth/google',
      {
        idToken,
      },
      httpOptions
    ).pipe(
      map((response: JwtResponse) => {
        // Store user and token separately
        this.storageService.saveUserAndToken(response);
        return response;
      })
    );
  }

  // Expose storage service signals for convenience
  get currentUser() {
    return this.storageService.currentUser;
  }

  get isLoggedIn() {
    return this.storageService.isLoggedIn;
  }
}
