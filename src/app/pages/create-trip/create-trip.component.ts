import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRoute } from '@fortawesome/free-solid-svg-icons';
// --- 1. استيراد الخدمات والنماذج الصحيحة ---
import { AuthService } from '../../services/auth.service';
import { TripService } from '../../services/trip.service';
// import { CreateTripCommand, Location } from '../../models';
import {
  faShieldAlt, faCheckCircle, faExclamationTriangle, faIdCard,
  faUserCheck, faCameraRetro, faCar, faClipboardCheck, faEdit,
  faArrowRight, faArrowLeft, faInfoCircle, faTimes
} from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-create-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './create-trip.component.html',
  styleUrls: ['./create-trip.component.css']
})
export class CreateTripComponent implements OnInit {

  // --- 2. حقن الخدمات باستخدام inject ---
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private tripService = inject(TripService);
   iconRoute = faRoute;
   icons = {
    main: faShieldAlt,
    success: faCheckCircle,
    error: faExclamationTriangle,
    license: faIdCard,
    identity: faUserCheck,
    camera: faCameraRetro,
    vehicle: faCar,
    review: faClipboardCheck,
    edit: faEdit,
    prev: faArrowRight,
    next: faArrowLeft,
    info: faInfoCircle,
    close: faTimes
  };
  // --- 3. إدارة حالة الواجهة باستخدام Signals ---
  tripForm!: FormGroup;
  isSubmitting = signal(false);
  isSuccess = signal(false);
  currentStep = signal(1);
  totalSteps = 3;

  // --- 4. بيانات مساعدة ---
  popularCities = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'طنطا',
    'بورسعيد', 'الإسماعيلية', 'السويس', 'الزقازيق', 'أسيوط'
  ];

  // --- 5. Computed Signal لحساب السعر الإجمالي بشكل تفاعلي ---
  totalPrice = computed(() => {
    const seats = this.tripForm?.get('availableSeats')?.value || 0;
    const price = this.tripForm?.get('pricePerSeat')?.value || 0;
    return seats * price;
  });

  ngOnInit(): void {
    // التحقق مما إذا كان المستخدم سائقًا موثقًا
    if (!this.authService.isVerifiedDriver()) {
      this.router.navigate(['/verify-driver']);
      return;
    }
    // بناء النموذج
    this.tripForm = this.fb.group({
      // Step 1
      startCity: ['', Validators.required],
      destinationCity: ['', Validators.required],
      // Step 2
      departureDateTime: ['', Validators.required],
      availableSeats: [1, [Validators.required, Validators.min(1)]],
      pricePerSeat: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  // --- 6. دوال التنقل والتحقق من الخطوات ---
  nextStep(): void {
    if (this.isStepValid()) {
      this.currentStep.update(step => Math.min(step + 1, this.totalSteps));
    }
  }

  previousStep(): void {
    this.currentStep.update(step => Math.max(step - 1, 1));
  }

  isStepValid(): boolean {
    const step = this.currentStep();
    if (step === 1) {
      return this.tripForm.get('startCity')!.valid && this.tripForm.get('destinationCity')!.valid;
    }
    if (step === 2) {
      return this.tripForm.get('departureDateTime')!.valid && this.tripForm.get('availableSeats')!.valid && this.tripForm.get('pricePerSeat')!.valid;
    }
    // الخطوة الأخيرة تتطلب أن يكون النموذج بأكمله صالحًا
    return this.tripForm.valid;
  }

  getStepTitle(): string {
    const titles = ['تفاصيل الرحلة', 'التوقيت والسعر', 'المراجعة النهائية'];
    return titles[this.currentStep() - 1];
  }

  // --- 7. دوال مساعدة للنموذج ---
  selectCity(city: string, controlName: 'startCity' | 'destinationCity'): void {
    this.tripForm.get(controlName)!.setValue(city);
  }

  addNote(note: string): void {
    const notesControl = this.tripForm.get('notes')!;
    const currentNotes = notesControl.value || '';
    const separator = currentNotes ? '. ' : '';
    notesControl.setValue(currentNotes + separator + note);
  }

  getMinDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for timezone
    return now.toISOString().slice(0, 16);
  }

  // --- 8. دالة الإرسال النهائية ---
  onSubmit(): void {
    if (!this.tripForm.valid) {
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.tripForm.value;

    // بناء CreateTripRequest
    const payload = {
      departureCity: formValue.startCity,
      departureLatitude: 0, // يمكن ربطها لاحقاً بخدمة خرائط
      departureLongitude: 0,
      destinationCity: formValue.destinationCity,
      destinationLatitude: 0,
      destinationLongitude: 0,
      departureTime: new Date(formValue.departureDateTime).toISOString(),
      seatsAvailable: Number(formValue.availableSeats),
      price: Number(formValue.pricePerSeat),
      notes: formValue.notes || ''
    };

    this.tripService.createTrip(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.isSuccess.set(true);
          setTimeout(() => this.router.navigate(['/my-rides']), 3000);
        },
        error: (err: any) => {
          console.error('Failed to create trip:', err);
        }
      });
  }

  // --- 9. دوال التنسيق للعرض في صفحة المراجعة ---
  formatDateTime(dateTimeString: string, part: 'date' | 'time'): string {
    if (!dateTimeString) return 'غير محدد';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return 'تاريخ غير صالح';

    if (part === 'date') {
      return date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else {
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  }
}
