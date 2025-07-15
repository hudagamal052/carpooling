import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AccountService } from '../api/services/account.service';
import { LoginCommand, JWTLoginResponseDTOResponse } from '../api/models/interfaces';

const AUTH_TOKEN_KEY = 'auth_token';
const IS_VERIFIED_KEY = 'is_verified'; // مفتاح جديد لتخزين حالة التوثيق

// واجهة لتمثيل بيانات المستخدم
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  profileImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // --- Signals لإدارة الحالة ---
  private readonly authToken = signal<string | null>(localStorage.getItem(AUTH_TOKEN_KEY));
  private readonly decodedUser = signal<UserProfile | null>(null);
  
  // === هذا هو الـ Signal الجديد والمهم ===
  // يقرأ القيمة من localStorage لضمان بقائها بعد تحديث الصفحة
  private readonly isVerified = signal<boolean>(localStorage.getItem(IS_VERIFIED_KEY) === 'true');

  // --- الخصائص العامة (Public) ---
  readonly currentUser = computed(() => this.decodedUser());
  readonly isLoggedIn = computed(() => !!this.authToken());
  
  // === الخاصية العامة الآن تقرأ من الـ Signal الجديد مباشرة ===
  readonly IsVerifiedDriver = computed(() => this.isVerified());

  constructor(
    private accountService: AccountService,
    private router: Router
  ) {
    const initialToken = this.authToken();
    if (initialToken) {
      this.decodeAndSetUser(initialToken);
    }

    // Effect لمراقبة التوكن
    effect(() => {
      const token = this.authToken();
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        this.decodeAndSetUser(token);
      } else {
        // عند تسجيل الخروج، قم بإزالة كل شيء
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(IS_VERIFIED_KEY);
        this.decodedUser.set(null);
        this.isVerified.set(false);
      }
    });
  }

  getToken(): string | null {
    return this.authToken();
  }

  login(credentials: LoginCommand): Observable<JWTLoginResponseDTOResponse> {
    return this.accountService.login(credentials).pipe(
      tap(response => {
        // === هذا هو التعديل الجوهري ===
        if (response.data?.token) {
          // 1. قم بتحديث التوكن
          this.authToken.set(response.data.token);
          
          // 2. اقرأ حالة التوثيق مباشرة من الاستجابة
          const isDriver = response.data.isVerifiedDriver ?? false;
          
          // 3. قم بتحديث الـ signal وتخزين القيمة في localStorage
          this.isVerified.set(isDriver);
          localStorage.setItem(IS_VERIFIED_KEY, isDriver.toString());

        } else {
          this.logout();
        }
      }),
      catchError(err => {
        console.error("Login failed:", err);
        this.logout();
        return of(err);
      })
    );
  }

  logout(): void {
    // الـ effect سيتولى عملية التنظيف عند تعيين التوكن إلى null
    this.authToken.set(null);
    this.router.navigate(['/login']);
  }

  private decodeAndSetUser(token: string): void {
    try {
      const decodedToken: any = jwtDecode(token);
      const userProfile: UserProfile = {
        uid: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        name: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        email: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
        profileImageUrl: decodedToken.profileImageUrl
      };
      this.decodedUser.set(userProfile );
    } catch (error) {
      console.error("Failed to decode JWT token:", error);
      this.logout();
    }
  }
}
