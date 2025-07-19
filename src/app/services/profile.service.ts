import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) {}

  // جلب بيانات بروفايل السائق
  getDriverProfile(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/Driver/GetDriverProfile`);
  }

  // جلب رحلات السائق مع دعم التصفح (pagination)
  getDriverTrips(page: number = 1, size: number = 10): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get(`${API_BASE_URL}/Driver/GetDriverTrips`, { params });
  }

  // جلب مستندات توثيق السائق
  getDriverVerificationDocuments(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/Driver/GetDriverVerificationDocuments`);
  }

  // جلب بيانات بروفايل الراكب
  getPassengerProfile(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/Passenger/GetPassengerProfile`);
  }

  // تعديل بيانات الراكب
  updatePassengerProfile(data: { Name: string; PhoneNumber: string; ProfileImage?: File }): Observable<any> {
    const formData = new FormData();
    formData.append('Name', data.Name);
    formData.append('PhoneNumber', data.PhoneNumber);
    if (data.ProfileImage) {
      formData.append('ProfileImage', data.ProfileImage);
    }
    return this.http.put(`${API_BASE_URL}/Passenger/UpdatePassengerProfile`, formData);
  }

  // تعديل بيانات السائق
  editDriverProfile(data: { driverName: string; phoneNumber: string; description: string; profileImage?: File }): Observable<any> {
    const formData = new FormData();
    formData.append('DriverName', data.driverName);
    formData.append('PhoneNumber', data.phoneNumber);
    formData.append('Description', data.description);
    if (data.profileImage) {
      formData.append('ProfileImage', data.profileImage);
    }
    return this.http.put(`${API_BASE_URL}/Driver/EditDriverProfile`, formData);
  }

  getDriverVehicleDetails(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/Driver/GetDriverVehicleDetails`);
  }
}