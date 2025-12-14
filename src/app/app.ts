import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { StorageService } from './core/services/storage.service';
import { AuthService } from './core/services/auth.service';
import { EventBusService } from './core/services/event-bus.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html'
})
export class App implements OnInit, OnDestroy {
  private storageService = inject(StorageService);
  private authService = inject(AuthService);
  private eventBusService = inject(EventBusService);
  private router = inject(Router);

  eventBusSub?: Subscription;
  mobileMenuOpen = signal(false);

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
  }

  ngOnDestroy(): void {
    if (this.eventBusSub) {
      this.eventBusSub.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: res => {
        console.log(res);
        this.storageService.clean();
        this.router.navigate(['/home']);
      },
      error: err => {
        console.log(err);
        // Clean storage even if logout API call fails
        this.storageService.clean();
        this.router.navigate(['/home']);
      }
    });
  }
}
