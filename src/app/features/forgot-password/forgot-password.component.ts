import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      this.error.set('Please enter a valid email address.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const email = this.forgotPasswordForm.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.loading.set(false);
        // Check if response indicates success (email was sent)
        if (response.message && response.message.includes('Password reset link has been sent')) {
          this.success.set(response.message);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          // Email doesn't exist or other issue
          this.error.set(response.message || 'No account found with this email address.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        // Handle HTTP error responses (400, 500, etc.)
        if (err.status === 400 || err.status === 404) {
          this.error.set(err?.error?.message ?? 'No account found with this email address.');
        } else {
          this.error.set(
            err?.error?.message ??
              err?.message ??
              'Unable to send password reset email. Please try again.'
          );
        }
      },
    });
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}

