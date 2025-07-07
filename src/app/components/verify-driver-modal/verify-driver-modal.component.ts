import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DriverVerificationData, VehicleInfo } from '../../models/user.model';

@Component({
  selector: 'app-verify-driver-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './verify-driver-modal.component.html',
  styleUrls: ['./verify-driver-modal.component.css']
})
export class VerifyDriverModalComponent {
  @Input() isVisible = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onVerificationComplete = new EventEmitter<boolean>();

  verificationForm: FormGroup;
  isSubmitting = false;
  selectedLicenseFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
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
            this.onVerificationComplete.emit(true);
            this.closeModal();
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Verification failed:', error);
        }
      });
    }
  }

  closeModal(): void {
    this.isVisible = false;
    this.onClose.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.verificationForm.reset();
    this.selectedLicenseFile = null;
    this.previewUrl = null;
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}

