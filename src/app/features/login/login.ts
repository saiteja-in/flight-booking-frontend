import { Component, OnInit, OnDestroy, AfterViewInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';
import { JwtResponse } from '../../core/models/jwt-response.model';

// Declared in index.html via Google Identity Services script
declare function handleGoogleCredentialResponse(response: any): void;

declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login implements OnInit, OnDestroy, AfterViewInit {
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  loginForm: FormGroup;
  isLoggedIn = signal(false);
  isLoginFailed = signal(false);
  errorMessage = signal('');
  roles = signal<string[]>([]);
  googleClientId = '718395966986-4i5t3n288i9jvbpcdq6mnruelggnhlth.apps.googleusercontent.com';

  private googleSignInListener?: (event: CustomEvent) => void;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn.set(true);
      const user = this.storageService.getUser();
      if (user) {
        this.roles.set(user.roles);
      }
    }

    // Check for OAuth2 callback
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        // Handle OAuth2 callback from backend
        const jwtResponse: JwtResponse = {
          token: params['token'],
          type: 'Bearer',
          id: parseInt(params['id'] || '0'),
          username: params['username'] || '',
          email: params['email'] || '',
          roles: params['roles'] ? params['roles'].split(',') : []
        };
        this.storageService.saveUserAndToken(jwtResponse);
        this.isLoginFailed.set(false);
        this.isLoggedIn.set(true);
        this.roles.set(jwtResponse.roles);
        this.router.navigate(['/home']);
      } else if (params['error']) {
        this.errorMessage.set(params['error']);
        this.isLoginFailed.set(true);
      }
    });

    if (this.isBrowser) {
      this.googleSignInListener = (event: CustomEvent) => {
        const credential = event.detail;
        this.handleGoogleSignIn(credential);
      };
      window.addEventListener('googleSignIn', this.googleSignInListener as EventListener);
    }

  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    if (window.google) {
      this.initializeGoogleSignIn();
    } else {
      // Wait for Google library to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          this.initializeGoogleSignIn();
          clearInterval(checkGoogle);
        }
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.googleSignInListener) {
      window.removeEventListener('googleSignIn', this.googleSignInListener as EventListener);
    }
  }

  private initializeGoogleSignIn(): void {
    if (!this.isBrowser || !window.google || !this.googleClientId) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: any) => {
        // This will trigger the global handler which dispatches the event
        if (typeof handleGoogleCredentialResponse === 'function') {
          handleGoogleCredentialResponse(response);
        }
      }
    });

    // Render the button programmatically after a short delay to ensure DOM is ready
    setTimeout(() => {
      if (!this.isBrowser) return;

      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer && window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.renderButton(buttonContainer, {
            type: 'standard',
            shape: 'rectangular',
            theme: 'outline',
            text: 'signin_with',
            size: 'large',
            logo_alignment: 'left',
            width: '100%'
          });
        } catch (error) {
          console.error('Error rendering Google Sign-In button:', error);
        }
      }
    }, 200);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (jwtResponse: JwtResponse) => {
        // User and token are already saved by AuthService
        this.isLoginFailed.set(false);
        this.isLoggedIn.set(true);
        this.roles.set(jwtResponse.roles);
        this.router.navigate(['/home']);
      },
      error: err => {
        const errorMsg = err.error?.error || err.error?.message || 'Login failed. Please check your credentials and try again.';
        this.errorMessage.set(errorMsg);
        this.isLoginFailed.set(true);
      }
    });
  }

  handleGoogleSignIn(credential: string): void {
    this.authService.loginWithGoogle(credential).subscribe({
      next: (jwtResponse: JwtResponse) => {
        this.isLoginFailed.set(false);
        this.isLoggedIn.set(true);
        this.roles.set(jwtResponse.roles);
        this.router.navigate(['/home']);
      },
      error: err => {
        this.errorMessage.set(err.error?.message || 'Google Sign-In failed');
        this.isLoginFailed.set(true);
      }
    });
  }
}

