import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<User> {
    const fakeUser: User = {
      id: Date.now().toString(),
      name: 'Test User',
      email: email,
      phone: '000-000-0000',
      role: 'passenger',
      password: password,
      profileImage: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    localStorage.setItem('currentUser', JSON.stringify(fakeUser));
    this.currentUserSubject.next(fakeUser);
    return of(fakeUser);
  }

  register(data: Partial<User>): Observable<User> {
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      role: data.role || 'passenger',
      profileImage: '',
      password: data.password || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    localStorage.setItem('currentUser', JSON.stringify(newUser));
    this.currentUserSubject.next(newUser);
    return of(newUser);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
