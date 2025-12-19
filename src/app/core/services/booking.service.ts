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

export interface PassengerResponse {
  fullName: string;
  gender: string;
  age: number;
  seatNumber: string;
  mealOption: string;
}

export interface BookingResponse {
  bookingId: string;
  pnr: string;
  contactEmail: string;
  userId: number;
  scheduleIds: string[];
  passengers: PassengerResponse[];
  createdAt: string;
  updatedAt: string;
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
        withCredentials: true, // Include cookies (JWT token)
      }
    );
  }

  getMyBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(
      `${this.baseUrl}/bookings`,
      {
        withCredentials: true, // Include cookies (JWT token)
      }
    );
  }
}

