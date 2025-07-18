import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Trip } from '../models/trip.model';
import { CreateTripRequest } from '../models/trip.model';
import { API_BASE_URL } from '../api';
import { TripCard } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/trips`).pipe(
      map(response => {
        // Ensure the response matches our Trip interface
        return response.map(trip => ({
          from: trip.from,
          to: trip.to,
          carType: trip.carType,
          availableSeats: trip.availableSeats,
          driver: {
            name: trip.driver.name,
            avatar: trip.driver.avatar,
            rating: trip.driver.rating
          }
        }));
      }),
      catchError(error => {
        console.error('Error fetching trips:', error);
        // Return mock data for development/testing
        return of(this.getMockTrips());
      })
    );
  }

  getTripsByLocation(departureCity: string, destinationCity: string, departureDate?: string): Observable<TripCard[]> {
    const params: any = {
      DepartureCity: departureCity,
      DestinationCity: destinationCity
    };
    if (departureDate) {
      params.DepartureDate = departureDate;
    }
    return this.http.get<any>(`${API_BASE_URL}/Trip/GetAllTrips`, { params }).pipe(
      map(response => response.data.items as TripCard[])
    );
  }

  getTripById(id: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiUrl}/trips/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching trip:', error);
        throw error;
      })
    );
  }

  createTrip(payload: CreateTripRequest): Observable<any> {
    return this.http.post<any>(`${API_BASE_URL}/Trip/CreateTrip`, payload);
  }

  getAllTrips(): Observable<TripCard[]> {
    return this.http.get<any>(`${API_BASE_URL}/Trip/GetAllTrips`).pipe(
      map(response => response.data.items as TripCard[])
    );
  }

  // Mock data for development/testing
  private getMockTrips(): Trip[] {
    return [
      {
        from: 'القاهرة',
        to: 'الإسكندرية',
        carType: 'سيارة رياضية',
        availableSeats: 3,
        driver: {
          name: 'أحمد محمد',
          avatar: 'https://via.placeholder.com/150',
          rating: 4.8
        }
      },
      {
        from: 'الجيزة',
        to: 'المنوفية',
        carType: 'سيارة عائلية',
        availableSeats: 2,
        driver: {
          name: 'سارة أحمد',
          avatar: 'https://via.placeholder.com/150',
          rating: 4.9
        }
      },
      {
        from: 'الإسكندرية',
        to: 'القاهرة',
        carType: 'سيارة اقتصادية',
        availableSeats: 4,
        driver: {
          name: 'محمد علي',
          avatar: 'https://via.placeholder.com/150',
          rating: 4.7
        }
      },
      {
        from: 'المنوفية',
        to: 'الجيزة',
        carType: 'سيارة فاخرة',
        availableSeats: 1,
        driver: {
          name: 'فاطمة حسن',
          avatar: 'https://via.placeholder.com/150',
          rating: 5.0
        }
      }
    ];
  }
} 