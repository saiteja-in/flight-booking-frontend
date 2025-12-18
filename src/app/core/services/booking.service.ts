import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PassengerRequest {
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  seatNumber: string;
  mealOption: 'VEG' | 'NON_VEG' | 'VEGAN';
}

export interface BookingCreateRequest {
  contactEmail: string;
  passengers: PassengerRequest[];
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8765/api/v1.0/flight';

  createBooking(scheduleId: string, request: BookingCreateRequest): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/booking/${scheduleId}`,
      request,
      {
        responseType: 'text',
      }
    );
  }
}

