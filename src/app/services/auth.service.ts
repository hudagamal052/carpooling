// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginData } from '../models/login.model';
import { RegisterData } from '../models/register.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { API_BASE_URL } from '../api';

@Injectable({ providedIn: 'root' } )
export class AuthService {
  private tokenKey = 'token';
  private isVerifiedDriverKey = 'isVerifiedDriver';

  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  private isVerifiedDriver$ = new BehaviorSubject<boolean>(this.getStoredIsVerifiedDriver());
  private currentUser$ = new BehaviorSubject<{ name: string; email: string; profileImageUrl: string } | null>(this.getCurrentUserFromToken());

  constructor(private http: HttpClient ) { }

  // دالة تسجيل الدخول (تبقى كما هي)
  login(data: LoginData): Observable<any> {
    const url = `${API_BASE_URL}/Account/Login`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return new Observable(observer => {
      this.http.post<any>(url, data, { headers } ).subscribe({
        next: (response) => {
          if (response.data?.token) {
            this.saveToken(response.data.token);
            this.setIsVerifiedDriver(response.data.isVerifiedDriver);
            this.loggedIn$.next(true);
            this.isVerifiedDriver$.next(response.data.isVerifiedDriver);
            this.currentUser$.next(this.getCurrentUserFromToken());
          }
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  // دالة تسجيل مستخدم جديد (تبقى كما هي)
  register(data: RegisterData): Observable<any> {
    const url = `${API_BASE_URL}/Account/RegisterUser`;
    const formData = new FormData();
    formData.append('Name', data.Name);
    formData.append('Email', data.Email);
    formData.append('Password', data.Password);
    formData.append('PhoneNumber', data.PhoneNumber);
    formData.append('Gender', data.Gender.toString());
    return this.http.post(url, formData );
  }

  // دالة تسجيل الخروج (تبقى كما هي)
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.isVerifiedDriverKey);
    this.loggedIn$.next(false);
    this.isVerifiedDriver$.next(false);
    this.currentUser$.next(null);
  }

  /**
   * *** النسخة المحدثة للتحقق من دور المسؤول ***
   * هذه الدالة تبحث عن 'Admin' أو 'Admain' (مع تجاهل حالة الأحرف).
   */
  public isAdmin(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    try {
      const payload = JSON.parse(this.parseJwtPayload(token));
      const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
      const userRoles = payload[roleClaim];

      if (!userRoles ) {
        return false; // لا يوجد حقل للأدوار
      }

      // التعامل مع الحالة التي تكون فيها الأدوار مصفوفة
      if (Array.isArray(userRoles)) {
        // تحويل كل الأدوار إلى حروف صغيرة للبحث
        const lowerCaseRoles = userRoles.map(r => String(r).toLowerCase());
        // التحقق من وجود 'admin' أو 'admain'
        return lowerCaseRoles.includes('admin') || lowerCaseRoles.includes('admain');
      }
      
      // التعامل مع الحالة التي يكون فيها الدور نصًا واحدًا
      if (typeof userRoles === 'string') {
        const lowerCaseRole = userRoles.toLowerCase();
        return lowerCaseRole === 'admin' || lowerCaseRole === 'admain';
      }

      return false; // إذا لم يكن مصفوفة أو نصًا

    } catch (e) {
      console.error("خطأ في قراءة التوكن:", e);
      return false;
    }
  }

  // --- باقي الدوال المساعدة (تبقى كما هي) ---

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  setIsVerifiedDriver(isVerified: boolean) {
    localStorage.setItem(this.isVerifiedDriverKey, JSON.stringify(isVerified));
  }

  getStoredIsVerifiedDriver(): boolean {
    const val = localStorage.getItem(this.isVerifiedDriverKey);
    return val ? JSON.parse(val) : false;
  }

  public isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }

  public isVerifiedDriver(): boolean {
    return this.isVerifiedDriver$.value;
  }

  public getLoggedInObservable(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  public getIsVerifiedDriverObservable(): Observable<boolean> {
    return this.isVerifiedDriver$.asObservable();
  }

  public getCurrentUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(this.parseJwtPayload(token));
      return payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
    } catch {
      return null;
    }
  }

  public getCurrentUser( ): { name: string; email: string; profileImageUrl: string } | null {
    return this.getCurrentUserFromToken();
  }

  private parseJwtPayload(token: string): string {
    let base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const decoded = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return decoded;
  }

  private getCurrentUserFromToken(): { name: string; email: string; profileImageUrl: string } | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(this.parseJwtPayload(token));
      return {
        name: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || 'مستخدم',
        email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || '',
        profileImageUrl: 'https://i.pravatar.cc/40'
      };
    } catch {
      return null;
    }
  }

  public getCurrentUserObservable( ): Observable<{ name: string; email: string; profileImageUrl: string } | null> {
    return this.currentUser$.asObservable();
  }

  getDriverVerifyStatus(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/Driver/GetDriverVerifyStatus` );
  }
}
