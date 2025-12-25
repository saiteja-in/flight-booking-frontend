import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService, BookingResponse } from '../../core/services/booking.service';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, ConfirmationDialogComponent],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css',
})
export class BookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);

  readonly bookings = signal<BookingResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showCancelDialog = signal(false);
  readonly selectedPnr = signal<string | null>(null);
  readonly canceling = signal(false);
  readonly filterStatus = signal<'ALL' | 'CONFIRMED' | 'CANCELLED'>('ALL');

  // Computed signal to filter bookings based on the selected filter
  readonly filteredBookings = computed(() => {
    const filter = this.filterStatus();
    const allBookings = this.bookings();

    if (filter === 'ALL') {
      return allBookings;
    }

    return allBookings.filter(booking => booking.status === filter);
  });

  // Computed signals for booking counts
  readonly confirmedCount = computed(() => {
    return this.bookings().filter(booking => booking.status === 'CONFIRMED').length;
  });

  readonly cancelledCount = computed(() => {
    return this.bookings().filter(booking => booking.status === 'CANCELLED').length;
  });

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading.set(true);
    this.error.set(null);

    this.bookingService.getMyBookings().subscribe({
      next: (bookings) => {
        this.loading.set(false);
        this.bookings.set(bookings);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err?.error?.message ??
            err?.message ??
            'Unable to load bookings. Please try again.'
        );
      },
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  goToSearch() {
    this.router.navigate(['/search']);
  }

  viewTicket(ticketId: string) {
    if (ticketId) {
      this.router.navigate(['/ticket', ticketId]);
    }
  }

  openCancelDialog(pnr: string) {
    this.selectedPnr.set(pnr);
    this.showCancelDialog.set(true);
  }

  closeDialog() {
    this.showCancelDialog.set(false);
    this.selectedPnr.set(null);
  }

  confirmCancel() {
    const pnr = this.selectedPnr();
    if (!pnr) {
      return;
    }

    this.canceling.set(true);
    this.bookingService.cancelBooking(pnr).subscribe({
      next: (response) => {
        this.canceling.set(false);
        this.closeDialog();
        // Reload bookings to reflect the cancellation
        this.loadBookings();
        // Optionally show success message
        this.error.set(null);
      },
      error: (err) => {
        this.canceling.set(false);
        this.error.set(
          err?.error?.message ??
            err?.message ??
            'Failed to cancel booking. Please try again.'
        );
      },
    });
  }

  setFilter(status: 'ALL' | 'CONFIRMED' | 'CANCELLED') {
    this.filterStatus.set(status);
  }
}

