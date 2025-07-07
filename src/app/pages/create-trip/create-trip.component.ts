import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TripService } from '../../services/trip.service';
import { CreateTripRequest, Location } from '../../models/trip.model';

@Component({
  selector: 'app-create-trip',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-trip.component.html',
  styleUrls: ['./create-trip.component.css']
})
export class CreateTripComponent implements OnInit {
  tripForm: FormGroup;
  isSubmitting = false;
  isSuccess = false;
  currentStep = 1;
  totalSteps = 3;

  // Popular cities for quick selection
  popularCities = [
    'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 
    'الخبر', 'تبوك', 'بريدة', 'خميس مشيط', 'حائل'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tripService: TripService,
    private router: Router
  ) {
    this.tripForm = this.fb.group({
      startAddress: ['', Validators.required],
      startCity: ['', Validators.required],
      destinationAddress: ['', Validators.required],
      destinationCity: ['', Validators.required],
      departureDate: ['', Validators.required],
      departureTime: ['', Validators.required],
      availableSeats: ['', [Validators.required, Validators.min(1), Validators.max(8)]],
      pricePerSeat: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Check if user is verified driver
    if (!this.authService.isVerifiedDriver()) {
      this.router.navigate(['/verify-driver']);
      return;
    }

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    if (dateInput) {
      dateInput.min = today;
    }
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  selectCity(city: string, field: string): void {
    this.tripForm.patchValue({ [field]: city });
  }

  onSubmit(): void {
    if (this.tripForm.valid) {
      this.isSubmitting = true;

      const startLocation: Location = {
        address: this.tripForm.value.startAddress,
        city: this.tripForm.value.startCity
      };

      const destination: Location = {
        address: this.tripForm.value.destinationAddress,
        city: this.tripForm.value.destinationCity
      };

      const tripData: CreateTripRequest = {
        startLocation: startLocation,
        destination: destination,
        departureDate: this.tripForm.value.departureDate,
        departureTime: this.tripForm.value.departureTime,
        availableSeats: parseInt(this.tripForm.value.availableSeats),
        pricePerSeat: parseFloat(this.tripForm.value.pricePerSeat),
        notes: this.tripForm.value.notes
      };

      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.tripService.createTrip(tripData, currentUser.id).subscribe({
          next: (trip) => {
            this.isSubmitting = false;
            this.isSuccess = true;
            
            // Redirect to trip details or dashboard after 3 seconds
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 3000);
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Failed to create trip:', error);
          }
        });
      }
    }
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1: return 'تفاصيل الرحلة';
      case 2: return 'التوقيت والسعر';
      case 3: return 'مراجعة البيانات';
      default: return '';
    }
  }

  isStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!(this.tripForm.get('startAddress')?.valid &&
               this.tripForm.get('startCity')?.valid &&
               this.tripForm.get('destinationAddress')?.valid &&
               this.tripForm.get('destinationCity')?.valid);
      case 2:
        return !!(this.tripForm.get('departureDate')?.valid &&
               this.tripForm.get('departureTime')?.valid &&
               this.tripForm.get('availableSeats')?.valid &&
               this.tripForm.get('pricePerSeat')?.valid);
      case 3:
        return !!this.tripForm.valid;
      default:
        return false;
    }
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getTotalPrice(): number {
    const seats = this.tripForm.value.availableSeats || 0;
    const price = this.tripForm.value.pricePerSeat || 0;
    return seats * price;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}

