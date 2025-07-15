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