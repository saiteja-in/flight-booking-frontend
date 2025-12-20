import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { StorageService } from './core/services/storage.service';
import { AuthService } from './core/services/auth.service';
import { EventBusService } from './core/services/event-bus.service';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ConfirmationDialogComponent],
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  private storageService = inject(StorageService);
  private authService = inject(AuthService);
  private eventBusService = inject(EventBusService);
  private router = inject(Router);

  eventBusSub?: Subscription;
  mobileMenuOpen = signal(false);
  showLogoutDialog = signal(false);

  // Computed signals for reactive state
  readonly isLoggedIn = computed(() => this.storageService.isLoggedIn());
  readonly currentUser = computed(() => this.storageService.getUser());
  readonly showAdminBoard = computed(() => {
    const user = this.currentUser();
    return user?.roles?.includes('ROLE_ADMIN') ?? false;
  });
  readonly username = computed(() => this.currentUser()?.username ?? '');

  ngOnInit(): void {
    this.eventBusSub = this.eventBusService.on('logout', () => {
      this.logout();
    });

    // Validate token on app initialization to sync state
    // If user data exists in localStorage but cookie is invalid/missing, clear it
    if (this.storageService.isLoggedIn()) {
      this.authService.validateToken().subscribe({
        error: () => {
          // Token invalid or missing - state is out of sync, clear localStorage
          // This handles cases where cookie was manually deleted or expired
          console.log('Token validation failed on app init - clearing localStorage');
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.eventBusSub) {
      this.eventBusSub.unsubscribe();
    }
  }

  openLogoutDialog(): void {
    this.showLogoutDialog.set(true);
  }

  closeLogoutDialog(): void {
    this.showLogoutDialog.set(false);
  }

  confirmLogout(): void {
    this.logout();
    this.closeLogoutDialog();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (res) => {
        console.log(res);
        this.storageService.clean();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.log(err);
        // Clean storage even if logout API call fails
        this.storageService.clean();
        this.router.navigate(['/home']);
      },
    });
  }
}
