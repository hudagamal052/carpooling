export interface Trip {
  from: string;
  to: string;
  carType: string;
  availableSeats: number;
  driver: {
    name: string;
    avatar: string;
    rating: number;
  };
}

export interface CreateTripRequest {
  departureCity: string;
  departureLatitude: number;
  departureLongitude: number;
  destinationCity: string;
  destinationLatitude: number;
  destinationLongitude: number;
  departureTime: string; // ISO string
  seatsAvailable: number;
  price: number;
  notes: string;
}

export interface TripCard {
  tripId: string;
  departureCity: string;
  destinationCity: string;
  carType: string;
  departureTime: string;
  availableSeats: number;
  price: number;
  driverName: string;
  driverImageUrl: string;
  rate: number;
} 