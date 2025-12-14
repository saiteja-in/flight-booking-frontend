import { Component, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  registerForm: FormGroup;
  isSuccessful = signal(false);
  isSignUpFailed = signal(false);
  errorMessage = signal('');

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const { username, email, password } = this.registerForm.value;

    this.authService.register(username, email, password).subscribe({
      next: data => {
        console.log(data);
        this.isSuccessful.set(true);
        this.isSignUpFailed.set(false);
        // Redirect to login after successful registration
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: err => {
        this.errorMessage.set(err.error?.message || 'Registration failed');
        this.isSignUpFailed.set(true);
      }
    });
  }
}

