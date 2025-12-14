import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/user.model';
import { JwtResponse } from '../models/jwt-response.model';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private userSignal = signal<User | null>(this.getUserFromStorage());

  // Computed signals for reactive state
  readonly currentUser = computed(() => this.userSignal());
  readonly isLoggedIn = computed(() => this.userSignal() !== null);

  constructor() {
    // Initialize from storage on service creation
    this.userSignal.set(this.getUserFromStorage());
  }

  clean(): void {
    // Clear user data from localStorage
    // Note: JWT token is stored in HttpOnly cookie and will be cleared by backend on logout
    window.localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
  }

  saveUser(user: User): void {
    // Use localStorage for persistence across browser sessions
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
  }

  saveUserAndToken(jwtResponse: JwtResponse): void {
    // Extract user data (without token)
    // Token is stored in HttpOnly cookie by backend, not accessible/managed by Angular
    const user: User = {
      id: jwtResponse.id,
      username: jwtResponse.username,
      email: jwtResponse.email,
      roles: jwtResponse.roles
    };

    // Store only user data (token is in HttpOnly cookie)
    this.saveUser(user);
  }

  getUser(): User | null {
    return this.userSignal();
  }

  private getUserFromStorage(): User | null {
    if (typeof window === 'undefined') {
      return null;
    }

    // Read from localStorage for persistence
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      try {
        return JSON.parse(user);
      } catch {
        return null;
      }
    }
    return null;
  }
}
