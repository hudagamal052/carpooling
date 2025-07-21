// src/app/services/admin.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api';

@Injectable({
  providedIn: 'root'
} )
export class AdminService {
  private readonly adminApiUrl = `${API_BASE_URL}/Admin`;

  constructor(private http: HttpClient ) { }

  getAllPassengers(page: number, pageSize: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get(`${this.adminApiUrl}/GetAllPassengers`, { params } );
  }

  getAllDrivers(page: number, pageSize: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get(`${this.adminApiUrl}/GetAllDrivers`, { params } );
  }

  /**
   * *** النسخة المصححة النهائية بناءً على مواصفات الـ API ***
   * جلب التفاصيل الكاملة لسائق معين باستخدام هويته.
   */
  getDriverDetailsById(driverId: string): Observable<any> {
    //
    // يتم إرسال هوية السائق كـ "معامل استعلام" (Query Parameter)
    // وليس كجزء من المسار.
    // اسم المعامل هو "DriverId" كما يظهر في صورة مواصفات الـ API.
    //
    const params = new HttpParams().set('DriverId', driverId);
    
    // إرسال الطلب مع الـ params.
    // لاحظ أن المسار لا يحتوي على /${driverId} في النهاية.
    return this.http.get(`${this.adminApiUrl}/GetDriverDetailsById`, { params } );
  }

  /**
   * توثيق حساب سائق معين.
   */
  verifyDriverById(driverId: string): Observable<any> {
    const params = new HttpParams().set('Id', driverId);
    return this.http.put(`${this.adminApiUrl}/VerifyDriverById`, null, { params } );
  }

  /**
   * توثيق مستند معين لسائق.
   */
  verifyDocumentById(documentId: string): Observable<any> {
    const params = new HttpParams().set('Id', documentId);
    return this.http.put(`${this.adminApiUrl}/VerifyDocumentById`, null, { params } );
  }
}
