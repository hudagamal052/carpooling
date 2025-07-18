import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-trip-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.css'
})
export class TripDetailsComponent implements OnInit {
  selectedSeats: number = 1;
  availableSeatsArray: number[] = [1, 2, 3, 4]; // سيتم تحديثها حسب المقاعد المتاحة
  tripId: string | null = null;
  showModal = false;
  showWaitMessage = false;
  modalSeats: number = 1;
  suggestedPrice: number = 0;
  trip: any = null;

  constructor(private route: ActivatedRoute, private tripService: TripService) {
    this.tripId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    if (this.tripId) {
      this.tripService.getTripById(this.tripId).subscribe(res => {
        this.trip = res.data;
        // تحديث مصفوفة المقاعد المتاحة بناءً على seatsNumber
        if (this.trip && this.trip.seatsNumber) {
          this.availableSeatsArray = Array.from({length: this.trip.seatsNumber}, (_, i) => i + 1);
        }
      });
    }
  }

  openModal() {
    this.modalSeats = 1;
    this.suggestedPrice = 0;
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
  }

  confirmBooking() {
    this.showModal = false;
    this.showWaitMessage = true;
    // هنا يمكنك إرسال البيانات للـ backend لاحقاً:
    // this.tripService.bookRide(this.tripId, this.modalSeats, this.suggestedPrice).subscribe(...)
  }

  closeWaitMessage() {
    this.showWaitMessage = false;
  }

  bookRide() {
    alert(`تم حجز ${this.selectedSeats} مقعد(مقاعد)!`);
    // هنا يمكنك لاحقًا ربطها بـ API أو منطق backend
  }
  openChat() {
    console.log('Opening chat...');
  }
}

