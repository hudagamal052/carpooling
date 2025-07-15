import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // تم تصحيح المسار

// --- هذا هو التعريف الحديث للـ Interceptor كدالة ---
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
 ): Observable<HttpEvent<unknown>> => {

  // 1. حقن خدمة المصادقة مباشرة داخل الدالة باستخدام inject
  const authService = inject(AuthService);
  
  // 2. الحصول على التوكن من الخدمة
  const authToken = authService.getToken();

  // 3. التحقق من وجود التوكن
  if (authToken) {
    // 4. إذا كان التوكن موجودًا، قم بنسخ الطلب وإضافة هيدر المصادقة
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`),
    });
    
    // 5. تمرير الطلب المنسوخ والمعدل إلى المعالج التالي
    return next(clonedReq);
  }

  // 6. إذا لم يكن هناك توكن، قم بتمرير الطلب الأصلي كما هو
  return next(req);
};
