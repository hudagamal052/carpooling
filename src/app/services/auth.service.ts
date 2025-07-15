import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginData } from '../models/login.model';
import { RegisterData } from '../models/register.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { API_BASE_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';
  private isVerifiedDriverKey = 'isVerifiedDriver';
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  private isVerifiedDriver$ = new BehaviorSubject<boolean>(this.getStoredIsVerifiedDriver());

  constructor(private http: HttpClient) {}

  login(data: LoginData): Observable<any> {
    const url = `${API_BASE_URL}/Account/Login`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return new Observable(observer => {
      this.http.post<any>(url, data, { headers }).subscribe({
        next: (response) => {
          if (response.data?.token) {
            this.saveToken(response.data.token);
            this.setIsVerifiedDriver(response.data.isVerifiedDriver);
            this.loggedIn$.next(true);
            this.isVerifiedDriver$.next(response.data.isVerifiedDriver);
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

  register(data: RegisterData): Observable<any> {
    const url = `${API_BASE_URL}/Account/RegisterUser`;
    const formData = new FormData();
    formData.append('Name', data.Name);
    formData.append('Email', data.Email);
    formData.append('Password', data.Password);
    formData.append('PhoneNumber', data.PhoneNumber);
    formData.append('Gender', data.Gender.toString());
    return this.http.post(url, formData);
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.isVerifiedDriverKey);
    this.loggedIn$.next(false);
    this.isVerifiedDriver$.next(false);
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
    // JWT: header.payload.signature
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Adjust the property name if your payload uses a different key for user id
      return payload.uid || payload.userId || payload.sub || null;
    } catch {
      return null;
    }
  }
} 