import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService, TicketResponse } from '../../core/services/booking.service';
import { FlightSearchService, FlightScheduleResponse } from '../../core/services/flight-search.service';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.css',
})
export class TicketComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly flightSearchService = inject(FlightSearchService);

  readonly ticket = signal<TicketResponse | null>(null);
  readonly schedule = signal<FlightScheduleResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    const ticketId = this.route.snapshot.paramMap.get('ticketId');
    if (!ticketId) {
      this.error.set('Invalid ticket ID');
      return;
    }
    this.loadTicket(ticketId);
  }

  loadTicket(ticketId: string) {
    this.loading.set(true);
    this.error.set(null);

    this.bookingService.getTicketById(ticketId).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
        // Load flight schedule details
        this.loadSchedule(ticket.scheduleId);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err?.error?.message ??
            err?.message ??
            'Unable to load ticket. Please try again.'
        );
      },
    });
  }

  loadSchedule(scheduleId: string) {
    this.flightSearchService.getScheduleById(scheduleId).subscribe({
      next: (schedule) => {
        this.schedule.set(schedule);
        this.loading.set(false);
      },
      error: (err) => {
        // Schedule load failure shouldn't block ticket display
        console.error('Failed to load schedule:', err);
        this.loading.set(false);
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

  formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    // Handle both full datetime and time-only strings
    const time = timeString.includes('T') 
      ? new Date(timeString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : timeString;
    return time;
  }

  formatDateOnly(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  goBack() {
    this.router.navigate(['/bookings']);
  }
}


