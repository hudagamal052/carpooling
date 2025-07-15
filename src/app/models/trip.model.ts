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