// src/app/models/trip-suggestion.model.ts

export interface SuggestedLocation {
  id: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export interface CreateTripSuggestionRequest {
  departure: SuggestedLocation;
  destination: SuggestedLocation;
  seatCount: number;
  suggestedPrice: number;
  preferredDepartureTime: string;
  description: string;
}

export interface TripSuggestion {
  id?: string; // ✅ Make ID optional
  departure: SuggestedLocation;
  destination: SuggestedLocation;
  seatCount: number;
  suggestedPrice: number;
  preferredDepartureTime: string;
  classifications: number;
  description: string;
  userName?: string;
  // ... other optional fields
}
