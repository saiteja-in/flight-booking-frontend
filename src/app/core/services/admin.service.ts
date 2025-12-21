import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Airline, Airport } from '../models/flight.enums';

export interface ApiResponse {
  message: string;
  status: string;
}

export interface FlightCreateRequest {
  flightNumber: string;
  airline: Airline;
  originAirport: Airport;
  destinationAirport: Airport;
  seatCapacity: number;
}

export interface FlightScheduleCreateRequest {
  flightNumber: string;
  flightDate: string; // ISO date format (yyyy-MM-dd)
  departureTime: string; // HH:mm format
  arrivalTime: string; // HH:mm format
  fare: number;
}

export interface FlightResponse {
  id: string;
  flightNumber: string;
  airline: string;
  originAirport: string;
  destinationAirport: string;
  seatCapacity: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8765/api/v1.0/flight/admin';

  createFlight(request: FlightCreateRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.baseUrl}/flights`,
      request,
      {
        withCredentials: true, // Include cookies (JWT token)
      }
    );
  }

  createSchedule(request: FlightScheduleCreateRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.baseUrl}/inventory`,
      request,
      {
        withCredentials: true, // Include cookies (JWT token)
      }
    );
  }

  getAllFlights(): Observable<FlightResponse[]> {
    return this.http.get<FlightResponse[]>(
      `${this.baseUrl}/flights`,
      {
        withCredentials: true, // Include cookies (JWT token)
      }
    );
  }
}

