import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  isDarkMode = false;
  isLoggedIn = false;
  isVerifiedDriver = false;

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isVerifiedDriver = this.authService.isVerifiedDriver();
    this.authService.getLoggedInObservable().subscribe(val => this.isLoggedIn = val);
    this.authService.getIsVerifiedDriverObservable().subscribe(val => this.isVerifiedDriver = val);
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  goToLogin() {
    this.router.navigate(['/auth']);
  }

  goToVerifyDriver() {
    this.router.navigate(['/verify-driver']);
  }

  goToCreateTrip() {
    if (this.isVerifiedDriver) {
      this.router.navigate(['/create-trip']);
    } else {
      this.router.navigate(['/verify-driver']);
    }
  }
} 