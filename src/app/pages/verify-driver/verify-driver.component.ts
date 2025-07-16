import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RegisterDriverService } from '../../services/register-driver.service';
import { AuthService } from '../../services/auth.service';
import {
  faShieldAlt, faCheckCircle, faExclamationTriangle, faIdCard,
  faUserCheck, faCameraRetro, faCar, faClipboardCheck, faEdit,
  faArrowRight, faArrowLeft, faInfoCircle, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-verify-driver',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './verify-driver.component.html',
  styleUrls: ['./verify-driver.component.css'],
  animations: [
    trigger('toastState', [
      state('void', style({ transform: 'translateY(150%)', opacity: 0 })),
      state('*', style({ transform: 'translateY(0)', opacity: 1 })),
      transition('void <=> *', animate('400ms ease-in-out'))
    ])
  ]
})
export class VerifyDriverComponent implements OnInit {
  // --- 1. حقن الخدمات ---
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private registerDriverService = inject(RegisterDriverService);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  // --- 2. تعريف الأيقونات ---
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

  // --- 3. متغيرات حالة الواجهة ---
  verificationForm!: FormGroup;
  currentStep = 1;
  totalSteps = 5;
  isSubmitting = false;
  toast: { message: string, type: 'success' | 'error' } | null = null;

  // --- 4. متغيرات لمعاينة الصور ---
  previews: {
    licenseFile: SafeUrl | null;
    driverIdFile: SafeUrl | null;
    vehicleImages: SafeUrl[];
  } = {
    licenseFile: null,
    driverIdFile: null,
    vehicleImages: []
  };

  // --- 5. Getter للوصول السهل إلى حقول النموذج ---
  get f() {
    return this.verificationForm.controls;
  }

  ngOnInit(): void {
    // --- 6. بناء النموذج مع جميع الحقول المطلوبة ---
    this.verificationForm = this.fb.group({
      licenseFile: [null, Validators.required],
      driverIdFile: [null],
      vehicleImages: [null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      vehicleMake: ['', Validators.required],
      vehicleModel: ['', Validators.required],
      vehicleColor: ['', Validators.required],
      vehicleSeats: [4, [Validators.required, Validators.min(1)]],
      plateNumber: ['', Validators.required],
      description: ['']
    });
  }

  // --- 7. دوال التنقل والتحقق ---
  nextStep(): void {
    if (this.isStepValid()) {
      this.currentStep++;
    } else {
      // إذا كانت الخطوة غير صالحة، قم بلمس جميع الحقول في تلك الخطوة لإظهار الأخطاء
      this.markStepAsTouched();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(): boolean {
    switch (this.currentStep) {
      case 1: return this.f['licenseFile'].valid;
      case 2: return true; // اختياري
      case 3: return this.f['vehicleImages'].valid;
      case 4: return ['email', 'vehicleMake', 'vehicleModel', 'vehicleColor', 'vehicleSeats', 'plateNumber'].every(field => this.f[field]?.valid);
      default: return true;
    }
  }

  getStepTitle(): string {
    const titles = ['رخصة القيادة', 'هوية السائق (اختياري)', 'صور المركبة', 'بيانات المركبة', 'المراجعة النهائية'];
    return titles[this.currentStep - 1];
  }

  // --- 8. دوال التعامل مع الملفات ---
  onFileSelected(event: Event, controlName: 'licenseFile' | 'driverIdFile'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.verificationForm.patchValue({ [controlName]: file });
      const objectUrl = URL.createObjectURL(file);
      this.previews[controlName] = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
    }
  }

  onMultipleFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.verificationForm.patchValue({ vehicleImages: files });
      this.previews.vehicleImages = files.map(file => this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)));
    }
  }

  // --- 9. دالة الإرسال النهائية ---
  onSubmit(): void {
    if (this.verificationForm.invalid) {
      this.verificationForm.markAllAsTouched();
      this.showToast('الرجاء مراجعة البيانات، هناك حقول غير مكتملة.', 'error');
      return;
    }

    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      this.showToast('لا يمكن تحديد هوية المستخدم. الرجاء تسجيل الدخول مرة أخرى.', 'error');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.verificationForm.value;

    // 1. إرسال البيانات النصية فقط (كـ FormData مسطح)
    const driverFormData = new FormData();
    driverFormData.append('ApplicationUserId', currentUserId);
    driverFormData.append('DriverDescription', formValue.description || '');
    driverFormData.append('VehicleDetailsCommand.DriverId', currentUserId);
    driverFormData.append('VehicleDetailsCommand.Model', formValue.vehicleModel);
    driverFormData.append('VehicleDetailsCommand.Color', formValue.vehicleColor);
    driverFormData.append('VehicleDetailsCommand.PlateNumber', formValue.plateNumber);
    driverFormData.append('VehicleDetailsCommand.SeatsNumber', formValue.vehicleSeats.toString());
    driverFormData.append('VehicleDetailsCommand.Description', '');

    this.registerDriverService.registerDriver(driverFormData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.data) {
            // 2. إذا نجح، أرسل الملفات
            const formData = new FormData();
            formData.append('Comment', formValue.description || '');
            if (formValue.licenseFile) {
              // DriverLicense كـ array
              formData.append('DriverLicense', formValue.licenseFile);
            }
            if (formValue.driverIdFile) {
              // Identity كـ array
              formData.append('Identity', formValue.driverIdFile);
            }
            if (formValue.vehicleImages && formValue.vehicleImages.length > 0) {
              (formValue.vehicleImages as File[]).forEach(file => {
                formData.append('VehicleRegistration', file);
              });
            }
            this.isSubmitting = true;
            this.registerDriverService.uploadDocuments(formData)
              .pipe(finalize(() => this.isSubmitting = false))
              .subscribe({
                next: (uploadRes) => {
                  if (uploadRes.data) {
                    this.showToast('تم إرسال طلب التوثيق والملفات بنجاح!', 'success');
            setTimeout(() => this.router.navigate(['/']), 3000);
                  } else {
                    this.showToast(uploadRes.message || 'تم حفظ البيانات لكن فشل رفع الملفات.', 'error');
                  }
                },
                error: (err) => {
                  this.showToast('تم حفظ البيانات لكن حدث خطأ في رفع الملفات.', 'error');
                }
              });
          } else {
            this.showToast(response.message || 'فشل إرسال البيانات.', 'error');
          }
        },
        error: (err) => {
          const serverMessage = err.error?.message || '';
          if (serverMessage.includes('Already a Driver')) {
            this.showToast('أنت بالفعل سائق موثق!', 'error');
          } else {
            this.showToast(serverMessage || 'حدث خطأ غير متوقع.', 'error');
          }
        }
      });
  }

  // --- 10. دوال مساعدة للإشعارات والتحقق ---
  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.hideToast(), 5000);
  }

  hideToast(): void {
    this.toast = null;
  }

  private markStepAsTouched(): void {
    if (this.currentStep === 1) {
      this.f['licenseFile'].markAsTouched();
    } else if (this.currentStep === 3) {
      this.f['vehicleImages'].markAsTouched();
    } else if (this.currentStep === 4) {
      Object.values(this.f).forEach(control => {
        control.markAsTouched();
      });
    }
  }
}
