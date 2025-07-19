// src/app/interceptors/auth.interceptor.ts (أو المسار الصحيح)

import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

// هذا هو التعريف الحديث للـ Interceptor كدالة
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
 ): Observable<HttpEvent<unknown>> => {

  // 1. حقن خدمة المصادقة
  const authService = inject(AuthService);
  
  // 2. الحصول على التوكن
  const authToken = authService.getToken();

  // 3. التحقق من وجود التوكن
  if (!authToken) {
    // إذا لم يكن هناك توكن، مرر الطلب الأصلي كما هو وانتهى الأمر
    return next(req);
  }

  // *** بداية التعديل المهم ***

  // 4. التحقق مما إذا كان الطلب يحتوي على FormData
  if (req.body instanceof FormData) {
    // إذا كان كذلك، قم فقط بإضافة هيدر الـ Authorization
    // لا تقم بتعيين 'Content-Type' يدويًا
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return next(authReq);
  } 
  
  // 5. للطلبات الأخرى (مثل JSON)، يمكنك إضافة هيدر الـ Content-Type إذا احتجت
  // ولكن في الغالب، إضافة هيدر الـ Authorization يكفي
  else {
    const authReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json', // هذا آمن للطلبات التي ليست FormData
        Authorization: `Bearer ${authToken}`
      }
    });
    return next(authReq);
  }

  // *** نهاية التعديل المهم ***
};
