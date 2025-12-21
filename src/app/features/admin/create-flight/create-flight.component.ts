import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, FlightCreateRequest } from '../../../core/services/admin.service';
import { Airline, Airport, AIRLINE_OPTIONS, AIRPORT_OPTIONS, AIRPORT_NAMES } from '../../../core/models/flight.enums';

@Component({
  selector: 'app-create-flight',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-flight.component.html',
  styleUrl: './create-flight.component.css',
})
export class CreateFlightComponent {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);

  readonly flightForm: FormGroup;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly airlines = AIRLINE_OPTIONS;
  readonly airports = AIRPORT_OPTIONS;
  readonly airportNames = AIRPORT_NAMES;

  constructor() {
    this.flightForm = this.fb.group({
      flightNumber: ['', [Validators.required, Validators.maxLength(10)]],
      airline: ['', Validators.required],
      originAirport: ['', Validators.required],
      destinationAirport: ['', Validators.required],
      seatCapacity: [1, [Validators.required, Validators.min(1), Validators.max(1000)]],
    }, {
      validators: this.originDestinationValidator
    });
  }

  originDestinationValidator(form: FormGroup) {
    const origin = form.get('originAirport')?.value;
    const destination = form.get('destinationAirport')?.value;
    if (origin && destination && origin === destination) {
      return { sameAirport: true };
    }
    return null;
  }

  onSubmit() {
    if (this.flightForm.invalid) {
      this.markFormGroupTouched(this.flightForm);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.flightForm.value;
    const request: FlightCreateRequest = {
      flightNumber: formValue.flightNumber.trim().toUpperCase(),
      airline: formValue.airline,
      originAirport: formValue.originAirport,
      destinationAirport: formValue.destinationAirport,
      seatCapacity: formValue.seatCapacity,
    };

    this.adminService.createFlight(request).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.success.set(response.message || 'Flight created successfully!');
        this.flightForm.reset({
          seatCapacity: 1
        });
        // Clear success message after 5 seconds
        setTimeout(() => this.success.set(null), 5000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err?.error?.message ??
            err?.message ??
            'Failed to create flight. Please try again.'
        );
      },
    });
  }

  onCancel() {
    this.flightForm.reset({
      seatCapacity: 1
    });
    this.error.set(null);
    this.success.set(null);
  }

  getAirportLabel(code: Airport): string {
    return `${code} - ${this.airportNames[code]}`;
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
    const field = this.flightForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['max'].max}`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
    }
    return null;
  }

  getFormError(): string | null {
    if (this.flightForm.errors && this.flightForm.touched) {
      if (this.flightForm.errors['sameAirport']) {
        return 'Origin and destination airports cannot be the same';
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      flightNumber: 'Flight number',
      airline: 'Airline',
      originAirport: 'Origin airport',
      destinationAirport: 'Destination airport',
      seatCapacity: 'Seat capacity',
    };
    return labels[fieldName] || fieldName;
  }
}



