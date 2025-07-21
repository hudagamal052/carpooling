import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // لإدارة إلغاء الاشتراكات

  isDarkMode = false;
  isLoggedIn = false;
  isVerifiedDriver = false;
  isDropdownOpenState = false;
  user: { name: string; email: string; profileImageUrl: string } | null = null;
  profileImageUrl: string = 'https://i.pravatar.cc/40';

  // اجعل authService عامًا (public ) للوصول إليه من القالب
  constructor(
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    // التحقق من حالة تسجيل الدخول عند بدء تشغيل المكون
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isVerifiedDriver = this.authService.isVerifiedDriver();
    this.user = this.authService.getCurrentUser();

    // الاشتراك في التغييرات
    this.subscribeToAuthChanges();

    // جلب البيانات الأولية إذا كان المستخدم مسجلاً دخوله بالفعل
    if (this.isLoggedIn) {
      this.fetchProfileData();
    }
  }

  // دالة مركزية للاشتراك في تغييرات المصادقة
  private subscribeToAuthChanges(): void {
    // مراقبة حالة تسجيل الدخول
    this.authService.getLoggedInObservable().pipe(takeUntil(this.destroy$)).subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.fetchProfileData(); // جلب البيانات عند تسجيل الدخول
      } else {
        this.user = null; // مسح بيانات المستخدم عند تسجيل الخروج
      }
      this.cdr.markForCheck();
    });

    // مراقبة حالة توثيق السائق
    this.authService.getIsVerifiedDriverObservable().pipe(takeUntil(this.destroy$)).subscribe(isVerified => {
      this.isVerifiedDriver = isVerified;
      this.cdr.markForCheck();
    });

    // مراقبة بيانات المستخدم
    this.authService.getCurrentUserObservable().pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.user = user;
      this.cdr.markForCheck();
    });
  }

  // دالة لجلب بيانات الملف الشخصي (صورة)
  private fetchProfileData(): void {
    const profileObservable = this.authService.isVerifiedDriver()
      ? this.profileService.getDriverProfile()
      : this.profileService.getPassengerProfile();

    profileObservable.pipe(takeUntil(this.destroy$)).subscribe(res => {
      const imageUrl = this.authService.isVerifiedDriver()
        ? res.data?.driverImageUrl
        : res.data?.profileImageUrl;
      this.profileImageUrl = imageUrl || 'https://i.pravatar.cc/40';
      this.cdr.markForCheck( );
    });
  }

  // دالة للتحقق من حالة توثيق السائق من الخادم
  checkDriverVerifyStatus() {
    this.authService.getDriverVerifyStatus().pipe(takeUntil(this.destroy$)).subscribe({
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

  // --- دوال للتحكم في واجهة المستخدم ---

  toggleDropdown() {
    this.isDropdownOpenState = !this.isDropdownOpenState;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.isDropdownOpenState = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
    this.isDropdownOpenState = false;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  goToLogin() {
    this.router.navigate(['/auth']);
  }

  goToCreateTrip() {
    if (this.isVerifiedDriver) {
      this.router.navigate(['/create-trip']);
    } else {
      this.router.navigate(['/verify-driver']);
    }
  }

  // إلغاء الاشتراك عند تدمير المكون لمنع تسرب الذاكرة
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
