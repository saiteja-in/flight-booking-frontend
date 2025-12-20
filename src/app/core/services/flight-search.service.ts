import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FlightSearchRequest {
  originAirport: string;
  destinationAirport: string;
  flightDate: string; // ISO date (yyyy-MM-dd)
}

export interface FlightScheduleResponse {
  scheduleId: string;
  flightId: string;
  flightNumber: string;
  airline: string;
  originAirport: string;
  destinationAirport: string;
  flightDate: string;
  departureTime: string;
  arrivalTime: string;
  fare: number;
  totalSeats: number;
  availableSeats: number;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class FlightSearchService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8765/api/v1.0/flight/admin';

  searchFlights(payload: FlightSearchRequest): Observable<FlightScheduleResponse[]> {
    return this.http.post<FlightScheduleResponse[]>(`${this.baseUrl}/search`, payload);
  }

  getScheduleById(scheduleId: string): Observable<FlightScheduleResponse> {
    return this.http.get<FlightScheduleResponse>(
      `${this.baseUrl}/internal/schedules/${scheduleId}`
    );
  }
}
