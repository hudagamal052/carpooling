export interface Trip {
  id: string;
  driverId: string;
  startLocation: Location;
  destination: Location;
  departureDate: Date;
  departureTime: string;
  availableSeats: number;
  totalSeats: number;
  pricePerSeat: number;
  notes?: string;
  status: TripStatus;
  passengers: Passenger[];
  createdAt: Date;
}

export interface Location {
  address: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Passenger {
  userId: string;
  name: string;
  phone: string;
  seatsBooked: number;
  bookingDate: Date;
}

export enum TripStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FULL = 'full'
}

export interface CreateTripRequest {
  startLocation: Location;
  destination: Location;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  notes?: string;
}

