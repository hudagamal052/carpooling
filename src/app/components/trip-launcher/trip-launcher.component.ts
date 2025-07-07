import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VerifyDriverModalComponent } from '../verify-driver-modal/verify-driver-modal.component';

@Component({
  selector: 'app-trip-launcher',
  standalone: true,
  imports: [CommonModule, VerifyDriverModalComponent],
  templateUrl: './trip-launcher.component.html',
  styleUrls: ['./trip-launcher.component.css']
})
export class TripLauncherComponent {
  showVerifyModal = false;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  onCreateTrip(): void {
    if (this.authService.isVerifiedDriver()) {
      this.router.navigate(['/create-trip']);
    } else {
      this.showVerifyModal = true;
    }
  }

  onModalClose(): void {
    this.showVerifyModal = false;
  }

  onVerificationComplete(success: boolean): void {
    if (success) {
      this.showVerifyModal = false;
      // Small delay to allow modal to close
      setTimeout(() => {
        this.router.navigate(['/create-trip']);
      }, 500);
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isVerifiedDriver(): boolean {
    return this.authService.isVerifiedDriver();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }
}

