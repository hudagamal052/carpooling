import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  isDarkMode = false;
  isLoggedIn = false;
  isVerifiedDriver = false;
  public isDropdownOpenState = false;

  // اجعل authService public ليكون متاحًا في القالب
  constructor(public authService: AuthService, private router: Router) {
    this.authService.getLoggedInObservable().subscribe(val => this.isLoggedIn = val);
    this.authService.getIsVerifiedDriverObservable().subscribe(val => this.isVerifiedDriver = val);
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isVerifiedDriver = this.authService.isVerifiedDriver();
  }

  // دالة حالة تسجيل الدخول
  isLoggedInFn(): boolean {
    return this.isLoggedIn;
  }

  // دالة حالة التوثيق
  isVerifiedDriverFn(): boolean {
    return this.isVerifiedDriver;
  }

  // دالة المستخدم الحالي (حقيقية من AuthService)
  currentUser() {
    return this.authService.getCurrentUser();
  }

  // القائمة المنسدلة
  isDropdownOpen(): boolean {
    return this.isDropdownOpenState;
  }
  toggleDropdown() {
    this.isDropdownOpenState = !this.isDropdownOpenState;
  }

  // التنقل
  navigateTo(path: string) {
    this.router.navigate([path]);
    this.isDropdownOpenState = false;
  }

  // تسجيل الخروج
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
    this.isDropdownOpenState = false;
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