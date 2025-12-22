import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';
import { AuthService } from '../../core/services/auth.service';
import { passwordValidator } from '../../core/validators/password.validator';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private storageService = inject(StorageService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  currentUser = computed(() => this.storageService.getUser());

  changePasswordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, passwordValidator()]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordsMatchValidator });

  isSubmitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  ngOnInit(): void {
    // Component is reactive through computed signal
  }

  private passwordsMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmitChangePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

    this.authService.changePassword(currentPassword, newPassword, confirmPassword).subscribe({
      next: (res) => {
        this.successMessage.set(res.message || 'Password updated successfully');
        this.errorMessage.set('');
        this.changePasswordForm.reset();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        const msg = err.error?.error || err.error?.message || 'Failed to update password. Please try again.';
        this.errorMessage.set(msg);
        this.successMessage.set('');
        this.isSubmitting.set(false);
      }
    });
  }
}

