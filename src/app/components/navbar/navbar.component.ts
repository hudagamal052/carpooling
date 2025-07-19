import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProfileService } from '../../services/profile.service';

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
  public user: { name: string; email: string; profileImageUrl: string } | null = null;
  public profileImageUrl: string = 'https://i.pravatar.cc/40';

  // اجعل authService public ليكون متاحًا في القالب
  constructor(
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private profileService: ProfileService
  ) {
    this.authService.getLoggedInObservable().subscribe(val => {
      this.isLoggedIn = val;
      this.cdr.markForCheck();
      if (val && this.authService.isVerifiedDriver()) {
        this.checkDriverVerifyStatus();
        // جلب صورة السائق
        this.profileService.getDriverProfile().subscribe(res => {
          this.profileImageUrl = res.data?.driverImageUrl || 'https://i.pravatar.cc/40';
          this.cdr.markForCheck();
        });
      } else if (val) {
        // جلب صورة الراكب
        this.profileService.getPassengerProfile().subscribe(res => {
          this.profileImageUrl = res.data?.profileImageUrl || 'https://i.pravatar.cc/40';
          this.cdr.markForCheck();
        });
      }
    });
    this.authService.getIsVerifiedDriverObservable().subscribe(val => {
      this.isVerifiedDriver = val;
      this.cdr.markForCheck();
    });
    this.authService.getCurrentUserObservable().subscribe(user => {
      this.user = user;
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn && this.authService.isVerifiedDriver()) {
      this.checkDriverVerifyStatus();
    }
    this.isVerifiedDriver = this.authService.isVerifiedDriver();
  }

  checkDriverVerifyStatus() {
    this.authService.getDriverVerifyStatus().subscribe({
      next: (res) => {
        this.isVerifiedDriver = !!res.data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isVerifiedDriver = false;
        this.cdr.markForCheck();
      }
    });
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