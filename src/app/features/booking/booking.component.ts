import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService, BookingCreateRequest, PassengerRequest } from '../../core/services/booking.service';
import { FlightSearchService } from '../../core/services/flight-search.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
})
export class BookingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly flightSearchService = inject(FlightSearchService);

  readonly scheduleId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly pnr = signal<string | null>(null);

  bookingForm: FormGroup = this.fb.group({
    contactEmail: ['', [Validators.required, Validators.email]],
    passengers: this.fb.array([]),
  });

  ngOnInit() {
    const scheduleIdParam = this.route.snapshot.paramMap.get('scheduleId');
    if (!scheduleIdParam) {
      this.error.set('Invalid flight schedule. Please select a flight to book.');
      return;
    }
    this.scheduleId.set(scheduleIdParam);
    // Add at least one passenger by default
    this.addPassenger();
  }

  get passengers(): FormArray {
    return this.bookingForm.get('passengers') as FormArray;
  }

  addPassenger() {
    const passengerGroup = this.fb.group({
      fullName: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      seatNumber: ['', [Validators.required]],
      mealOption: ['', [Validators.required]],
    });
    this.passengers.push(passengerGroup);
  }

  removePassenger(index: number) {
    if (this.passengers.length > 1) {
      this.passengers.removeAt(index);
    }
  }

  submit() {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.error.set('Please fill in all required fields correctly.');
      return;
    }

    const scheduleId = this.scheduleId();
    if (!scheduleId) {
      this.error.set('Invalid flight schedule.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.bookingForm.value;
    const request: BookingCreateRequest = {
      contactEmail: formValue.contactEmail,
      passengers: formValue.passengers.map((p: any) => ({
        fullName: p.fullName,
        gender: p.gender,
        age: parseInt(p.age, 10),
        seatNumber: p.seatNumber,
        mealOption: p.mealOption,
      })),
    };

    this.bookingService.createBooking(scheduleId, request).subscribe({
      next: (pnr) => {
        this.loading.set(false);
        this.pnr.set(pnr);
        this.success.set('Booking confirmed successfully!');
        // additional func
        // setTimeout(() => this.router.navigate(['/user']), 5000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err?.error?.message ??
            err?.message ??
            'Unable to complete booking. Please try again.'
        );
      },
    });
  }

  goBack() {
    this.router.navigate(['/search']);
  }
}

