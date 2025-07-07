import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'مشاركة الرحلات';
  isMenuOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize with a mock user for demo purposes
    if (!this.authService.isLoggedIn()) {
      this.authService.login('demo@example.com', 'password').subscribe();
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
    this.closeMenu();
  }

  navigateToCreateTrip(): void {
    if (this.authService.isVerifiedDriver()) {
      this.router.navigate(['/create-trip']);
    } else {
      this.router.navigate(['/verify-driver']);
    }
    this.closeMenu();
  }

  navigateToVerifyDriver(): void {
    this.router.navigate(['/verify-driver']);
    this.closeMenu();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.closeMenu();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isVerifiedDriver(): boolean {
    return this.authService.isVerifiedDriver();
  }
}

