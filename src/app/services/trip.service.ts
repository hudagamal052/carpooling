import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Trip, CreateTripRequest, TripStatus } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private tripsSubject = new BehaviorSubject<Trip[]>([]);
  public trips$ = this.tripsSubject.asObservable();

  constructor() {
    // Load trips from localStorage if exists
    const savedTrips = localStorage.getItem('trips');
    if (savedTrips) {
      this.tripsSubject.next(JSON.parse(savedTrips));
    }
  }

  getTrips(): Trip[] {
    return this.tripsSubject.value;
  }

  getTripById(id: string): Trip | undefined {
    return this.getTrips().find(trip => trip.id === id);
  }

  createTrip(tripData: CreateTripRequest, driverId: string): Observable<Trip> {
    return new Observable(observer => {
      setTimeout(() => {
        const newTrip: Trip = {
          id: this.generateId(),
          driverId: driverId,
          startLocation: tripData.startLocation,
          destination: tripData.destination,
          departureDate: new Date(tripData.departureDate),
          departureTime: tripData.departureTime,
          availableSeats: tripData.availableSeats,
          totalSeats: tripData.availableSeats,
          pricePerSeat: tripData.pricePerSeat,
          notes: tripData.notes,
          status: TripStatus.ACTIVE,
          passengers: [],
          createdAt: new Date()
        };

        const currentTrips = this.getTrips();
        const updatedTrips = [...currentTrips, newTrip];
        this.tripsSubject.next(updatedTrips);
        localStorage.setItem('trips', JSON.stringify(updatedTrips));

        observer.next(newTrip);
        observer.complete();
      }, 1000);
    });
  }

  updateTrip(tripId: string, updates: Partial<Trip>): Observable<Trip> {
    return new Observable(observer => {
      setTimeout(() => {
        const trips = this.getTrips();
        const tripIndex = trips.findIndex(trip => trip.id === tripId);
        
        if (tripIndex !== -1) {
          const updatedTrip = { ...trips[tripIndex], ...updates };
          trips[tripIndex] = updatedTrip;
          
          this.tripsSubject.next([...trips]);
          localStorage.setItem('trips', JSON.stringify(trips));
          
          observer.next(updatedTrip);
        } else {
          observer.error('Trip not found');
        }
        observer.complete();
      }, 500);
    });
  }

  deleteTrip(tripId: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const trips = this.getTrips();
        const filteredTrips = trips.filter(trip => trip.id !== tripId);
        
        this.tripsSubject.next(filteredTrips);
        localStorage.setItem('trips', JSON.stringify(filteredTrips));
        
        observer.next(true);
        observer.complete();
      }, 500);
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

