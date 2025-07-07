import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, DriverVerificationData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Load user from localStorage if exists
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isVerifiedDriver(): boolean {
    const user = this.getCurrentUser();
    return user ? user.isVerifiedDriver : false;
  }

  login(email: string, password: string): Observable<User> {
    // Simulate API call - replace with actual authentication
    return new Observable(observer => {
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          name: 'أحمد محمد',
          email: email,
          phone: '+966501234567',
          isVerifiedDriver: false, // Initially not verified
          createdAt: new Date()
        };
        
        this.currentUserSubject.next(mockUser);
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        observer.next(mockUser);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  verifyDriver(verificationData: DriverVerificationData): Observable<boolean> {
    // Simulate API call for driver verification
    return new Observable(observer => {
      setTimeout(() => {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            isVerifiedDriver: true,
            driverLicense: verificationData.licenseNumber,
            vehicleInfo: verificationData.vehicleInfo
          };
          
          this.currentUserSubject.next(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      }, 2000);
    });
  }

  updateVerificationStatus(isVerified: boolean): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, isVerifiedDriver: isVerified };
      this.currentUserSubject.next(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  }
}

