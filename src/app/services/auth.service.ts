import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LoginData } from '../models/login.model';
import { RegisterData } from '../models/register.model';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(data: LoginData): Observable<any> {
    const url = `${API_BASE_URL}/Account/Login`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, data, { headers });
  }

  register(data: RegisterData): Observable<any> {
    const url = `${API_BASE_URL}/Account/RegisterUser`;
    
    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append('Name', data.Name);
    formData.append('Email', data.Email);
    formData.append('Password', data.Password);
    formData.append('PhoneNumber', data.PhoneNumber);
    formData.append('Gender', data.Gender.toString());
    
    // Debug: Log the data being sent
    console.log('Sending registration data:', {
      Name: data.Name,
      Email: data.Email,
      Password: data.Password,
      PhoneNumber: data.PhoneNumber,
      Gender: data.Gender
    });
    
    // Don't set Content-Type header - let the browser set it with boundary for multipart/form-data
    return this.http.post(url, formData);
  }
} 