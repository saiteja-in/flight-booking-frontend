import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlightSearchService, FlightScheduleResponse } from '../../core/services/flight-search.service';
import { AirportOption, AIRPORTS } from '../../shared/airports';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent {
  private readonly fb = inject(FormBuilder);
  private readonly flightSearchService = inject(FlightSearchService);

  readonly airports = AIRPORTS;
  readonly form = this.fb.group({
    originAirport: ['', Validators.required],
    destinationAirport: ['', Validators.required],
    flightDate: ['', Validators.required],
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly results = signal<FlightScheduleResponse[]>([]);
  readonly submitted = signal(false);

  readonly originLabel = signal('Select airport');
  readonly destinationLabel = signal('Select airport');

  originOpen = false;
  destinationOpen = false;

  selectAirport(controlName: 'originAirport' | 'destinationAirport', option: AirportOption) {
    this.form.patchValue({ [controlName]: option.code });
    if (controlName === 'originAirport') {
      this.originLabel.set(option.label);
      this.originOpen = false;
    } else {
      this.destinationLabel.set(option.label);
      this.destinationOpen = false;
    }
  }

  submit() {
    this.submitted.set(true);
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { originAirport, destinationAirport, flightDate } = this.form.value;

    this.flightSearchService
      .searchFlights({
        originAirport: originAirport!.toUpperCase(),
        destinationAirport: destinationAirport!.toUpperCase(),
        flightDate: flightDate!,
      })
      .subscribe({
        next: (res) => {
          this.results.set(res ?? []);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.results.set([]);
          this.error.set(
            err?.error?.message ??
              err?.message ??
              'Unable to search flights right now. Please try again.',
          );
        },
      });
  }

  private getLabelForCode(code?: string | null): string {
    if (!code) return 'Select airport';
    return this.airports.find((a) => a.code === code)?.label ?? code;
  }
}
