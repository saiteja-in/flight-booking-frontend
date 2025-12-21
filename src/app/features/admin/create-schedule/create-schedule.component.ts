import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, FlightScheduleCreateRequest, FlightResponse } from '../../../core/services/admin.service';

@Component({
  selector: 'app-create-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-schedule.component.html',
  styleUrl: './create-schedule.component.css',
})
export class CreateScheduleComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);

  readonly scheduleForm: FormGroup;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly flights = signal<FlightResponse[]>([]);
  readonly loadingFlights = signal(false);

  // Get today's date in ISO format for date input min attribute
  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  constructor() {
    const today = new Date().toISOString().split('T')[0];
    this.scheduleForm = this.fb.group({
      flightNumber: ['', Validators.required],
      flightDate: [today, [Validators.required, this.futureOrPresentDateValidator]],
      departureTime: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      fare: [1.0, [Validators.required, Validators.min(1.0)]],
    }, {
      validators: this.timeValidator
    });
  }

  ngOnInit() {
    this.loadFlights();
  }

  loadFlights() {
    this.loadingFlights.set(true);
    this.adminService.getAllFlights().subscribe({
      next: (flights) => {
        this.loadingFlights.set(false);
        this.flights.set(flights);
      },
      error: (err) => {
        this.loadingFlights.set(false);
        this.error.set('Failed to load flights. Please refresh the page.');
      },
    });
  }

  futureOrPresentDateValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  timeValidator(form: FormGroup) {
    const departureTime = form.get('departureTime')?.value;
    const arrivalTime = form.get('arrivalTime')?.value;
    if (departureTime && arrivalTime) {
      if (arrivalTime <= departureTime) {
        return { invalidTime: true };
      }
    }
    return null;
  }

  onSubmit() {
    if (this.scheduleForm.invalid) {
      this.markFormGroupTouched(this.scheduleForm);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.scheduleForm.value;
    const request: FlightScheduleCreateRequest = {
      flightNumber: formValue.flightNumber,
      flightDate: formValue.flightDate,
      departureTime: formValue.departureTime,
      arrivalTime: formValue.arrivalTime,
      fare: parseFloat(formValue.fare),
    };

    this.adminService.createSchedule(request).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.success.set(response.message || 'Flight schedule created successfully!');
        const today = new Date().toISOString().split('T')[0];
        this.scheduleForm.reset({
          flightDate: today,
          fare: 1.0
        });
        // Clear success message after 5 seconds
        setTimeout(() => this.success.set(null), 5000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err?.error?.message ??
            err?.message ??
            'Failed to create flight schedule. Please try again.'
        );
      },
    });
  }

  onCancel() {
    const today = new Date().toISOString().split('T')[0];
    this.scheduleForm.reset({
      flightDate: today,
      fare: 1.0
    });
    this.error.set(null);
    this.success.set(null);
  }

  getFlightDisplay(flight: FlightResponse): string {
    return `${flight.flightNumber} - ${flight.airline.replace('_', ' ')} (${flight.originAirport} → ${flight.destinationAirport})`;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.scheduleForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['pastDate']) {
        return 'Flight date must be today or a future date';
      }
    }
    return null;
  }

  getFormError(): string | null {
    if (this.scheduleForm.errors && this.scheduleForm.touched) {
      if (this.scheduleForm.errors['invalidTime']) {
        return 'Arrival time must be after departure time';
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      flightNumber: 'Flight number',
      flightDate: 'Flight date',
      departureTime: 'Departure time',
      arrivalTime: 'Arrival time',
      fare: 'Fare',
    };
    return labels[fieldName] || fieldName;
  }
}

