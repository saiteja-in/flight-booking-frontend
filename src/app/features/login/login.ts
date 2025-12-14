import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';
import { JwtResponse } from '../../core/models/jwt-response.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm: FormGroup;
  isLoggedIn = signal(false);
  isLoginFailed = signal(false);
  errorMessage = signal('');
  roles = signal<string[]>([]);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
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
        this.errorMessage.set(err.error?.message || 'Login failed');
        this.isLoginFailed.set(true);
      }
    });
  }
}

