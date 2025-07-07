import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DriverVerificationData, VehicleInfo } from '../../models/user.model';

@Component({
  selector: 'app-verify-driver',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './verify-driver.component.html',
  styleUrls: ['./verify-driver.component.css']
})
export class VerifyDriverComponent implements OnInit {
  verificationForm: FormGroup;
  isSubmitting = false;
  selectedLicenseFile: File | null = null;
  previewUrl: string | null = null;
  currentStep = 1;
  totalSteps = 3;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.verificationForm = this.fb.group({
      licenseNumber: ['', [Validators.required, Validators.minLength(10)]],
      vehicleMake: ['', Validators.required],
      vehicleModel: ['', Validators.required],
      vehicleYear: ['', [Validators.required, Validators.min(2000), Validators.max(new Date().getFullYear())]],
      vehicleColor: ['', Validators.required],
      plateNumber: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(8)]]
    });
  }

  ngOnInit(): void {
    // Check if user is already verified
    if (this.authService.isVerifiedDriver()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedLicenseFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
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

  onSubmit(): void {
    if (this.verificationForm.valid && this.selectedLicenseFile) {
      this.isSubmitting = true;

      const vehicleInfo: VehicleInfo = {
        make: this.verificationForm.value.vehicleMake,
        model: this.verificationForm.value.vehicleModel,
        year: this.verificationForm.value.vehicleYear,
        color: this.verificationForm.value.vehicleColor,
        plateNumber: this.verificationForm.value.plateNumber,
        capacity: this.verificationForm.value.capacity
      };

      const verificationData: DriverVerificationData = {
        licenseNumber: this.verificationForm.value.licenseNumber,
        licenseImage: this.selectedLicenseFile,
        vehicleInfo: vehicleInfo
      };

      this.authService.verifyDriver(verificationData).subscribe({
        next: (success) => {
          this.isSubmitting = false;
          if (success) {
            // Show success message and redirect
            setTimeout(() => {
              this.router.navigate(['/create-trip']);
            }, 2000);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Verification failed:', error);
        }
      });
    }
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1: return 'بيانات رخصة القيادة';
      case 2: return 'بيانات المركبة';
      case 3: return 'مراجعة البيانات';
      default: return '';
    }
  }

  isStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!(this.verificationForm.get('licenseNumber')?.valid && this.selectedLicenseFile !== null);
      case 2:
        return !!(this.verificationForm.get('vehicleMake')?.valid &&
               this.verificationForm.get('vehicleModel')?.valid &&
               this.verificationForm.get('vehicleYear')?.valid &&
               this.verificationForm.get('vehicleColor')?.valid &&
               this.verificationForm.get('plateNumber')?.valid &&
               this.verificationForm.get('capacity')?.valid);
      case 3:
        return !!(this.verificationForm.valid && this.selectedLicenseFile !== null);
      default:
        return false;
    }
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}

