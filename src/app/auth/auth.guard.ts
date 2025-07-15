// src/app/core/auth/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // استخدم signal 'isLoggedIn' بدلاً من دالة 'isAuthenticated'
  if (authService.isLoggedIn()) { 
    return true; // إذا كانت قيمة الـ signal هي true، اسمح بالمرور
  } else {
    // إذا لم يكن مسجلاً دخوله، أعد توجيهه إلى صفحة تسجيل الدخول
    router.navigate(['/login']);
    return false;
  }
};
