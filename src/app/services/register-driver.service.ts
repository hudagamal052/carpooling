import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BooleanResponse,
  JWTLoginResponseDTOResponse,
  LoginCommand,
  StringResponse
} from '../models'; // الاستيراد من ملف index.ts المركزي
export class RegisterDriverService{
    registerDriver(payload: FormData): Observable<BooleanResponse> {
        return this.http.post<BooleanResponse>(
          `${this.apiUrl}/RegisterDriver`,
          payload
        );
      }
  /**
   * يجلب رابط صورة الملف الشخصي للمستخدم الحالي.
   */
  getCurrentUserProfileImageURL(): Observable<StringResponse> {
    return this.http.get<StringResponse>(
      `${this.apiUrl}/GetCurrentUserProfileImageURL`
    );
}
}