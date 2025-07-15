import { Component } from '@angular/core';

@Component({
  selector: 'app-trip-details',
  imports: [],
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.css'
})
export class TripDetailsComponent {
  selectedSeats = 1;
  
  driverImage = 'https://via.placeholder.com/40x40/9CA3AF/FFFFFF?text=D';
  carImage = 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg';
  passenger1Image = 'https://via.placeholder.com/40x40/9CA3AF/FFFFFF?text=P1';
  passenger2Image = 'https://s3.amazonaws.com/holdenluntz.com/wp-content/uploads/20221013184621/Harry-Benson-Bobby-Fischer-Buenos-Aires.jpg';
  
  carDetails = {
    plateNumber: '7582 ر.أ.س',
    seats: 4
  };

  bookRide() {
    console.log('Booking ride...');
  }

  openChat() {
    console.log('Opening chat...');
  }

}

