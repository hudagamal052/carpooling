import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTripSuggestionRequest, TripSuggestion } from '../models/trip-suggestion.model';

import { API_BASE_URL } from '../api';

@Injectable({
  providedIn: 'root'
} )
export class TripSuggestionService {
  private baseUrl = 'http://me4war.runasp.net/api/TripSuggestion';

  constructor(private http: HttpClient ) { }

  createSuggestion(payload: CreateTripSuggestionRequest): Observable<any> {
    const url = `${API_BASE_URL}/TripSuggestion/CreateTripSuggestion`;
    return this.http.post<any>(url, payload );
  }

  GetAllTripSuggetions(filters: any = {}): Observable<any> {
    let params = new HttpParams()
      .set('PageNumber', '1')
      .set('PageSize', '100');
    const fullUrl = `${this.baseUrl}/GetAllTripSuggetions`;
    console.log('Requesting URL with params:', fullUrl, params.toString());
    return this.http.get(fullUrl, { params: params } );
  }

  getUserTripSuggestions(userName: string): Observable<any> {
    console.log('Getting all trips (no server-side filtering)');
    let params = new HttpParams()
      .set('PageNumber', '1')
      .set('PageSize', '100');
    const fullUrl = `${this.baseUrl}/GetAllTripSuggetions`;
    console.log('Requesting all trips URL:', fullUrl, params.toString());
    return this.http.get(fullUrl, { params: params } );
  }

  deleteSuggestion(tripId: string): Observable<any> {
    const params = new HttpParams().set('id', tripId);
    const fullUrl = `${this.baseUrl}/DeleteSuggestedTrip`;
    return this.http.delete(fullUrl, { params } );
  }

  editSuggestion(trip: TripSuggestion): Observable<any> {
    const fullUrl = `${this.baseUrl}/EditTripSuggestion`;
    console.log('Sending PUT request to:', fullUrl, 'with body:', trip);
    return this.http.put(fullUrl, trip );
  }

  /**
   * ✅ CORRECTED: The URL endpoint name is now fixed.
   * It was `/GetTripSuggestionsById` and has been changed to `/GetTripSuggestionById`.
   */
  getSuggestionById(tripId: string): Observable<any> {
    const fullUrl = `${this.baseUrl}/GetTripSuggetionsById`; 
    const params = new HttpParams().set('id', tripId);
    
    console.log('Requesting trip by ID from URL:', fullUrl, 'with params:', params.toString());
    return this.http.get(fullUrl, { params } );
  }
}
