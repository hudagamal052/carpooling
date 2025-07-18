// src/app/pages/auth/auth.component.ts

import { Component, HostBinding, OnInit } from '@angular/core'; // 1. أضف OnInit
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router'; // 2. أضف ActivatedRoute
import { AuthService } from '../../services/auth.service';
import { LoginData } from '../../models/login.model';
import { RegisterData } from '../../models/register.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit { // 3. قم بتطبيق OnInit
  isRegisterState = false;

  loginData: LoginData = { email: '', password: '' };
  registerData: RegisterData = {
    Name: '',
    Email: '',
    Password: '',
    ConfirmPassword: '',
    PhoneNumber: '',
    Gender: 0
  };
  loginError: string = '';
  registerError: string = '';
  registerSuccess: string = '';

  // متغير لتخزين رابط العودة
  private returnUrl: string = '/';

  @HostBinding('class.register-state') get registerStateClass() {
    return this.isRegisterState;
  }

  // 4. قم بحقن ActivatedRoute
  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute 
  ) { }

  // 5. اقرأ رابط العودة عند تهيئة المكون
  ngOnInit(): void {
    // اقرأ 'returnUrl' من query params. إذا لم يكن موجودًا، استخدم '/' كقيمة افتراضية.
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  toggleState(): void {
    const left = document.querySelector('.content-left') as HTMLElement;
    const right = document.querySelector('.content-right') as HTMLElement;
    left?.classList.add('transition-hidden');
    right?.classList.add('transition-hidden');
    setTimeout(() => {
      this.isRegisterState = !this.isRegisterState;
      setTimeout(() => {
        left?.classList.remove('transition-hidden');
        right?.classList.remove('transition-hidden');
      }, 50);
    }, 300);
  }

  onLoginSubmit(form: NgForm) {
    if (form.invalid) return;
    this.loginError = '';
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        // *** 6. استخدم رابط العودة الذي حفظناه ***
        // أعد توجيه المستخدم إلى الصفحة التي كان يحاول الوصول إليها
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loginError = 'فشل تسجيل الدخول. تأكد من البيانات.';
      }
    });
  }

  onRegisterSubmit(form: NgForm) {
    if (form.invalid) return;
    this.registerError = '';
    this.registerSuccess = '';
    if (this.registerData.Password !== this.registerData.ConfirmPassword) {
      this.registerError = 'كلمتا المرور غير متطابقتين.';
      return;
    }
    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        this.registerSuccess = 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.';
        // بعد التسجيل الناجح، قم بتبديل الواجهة إلى فورم تسجيل الدخول
        this.toggleState(); 
        // املأ بيانات تسجيل الدخول تلقائيًا لتسهيل الأمر على المستخدم
        this.loginData.email = this.registerData.Email;
        this.loginData.password = ''; // اترك كلمة المرور فارغة ليدخلها المستخدم بنفسه
      },
      error: (err) => {
        console.error('Registration error:', err);
        if (err.error && err.error.errors) {
          const errorMessages = Object.values(err.error.errors).flat();
          this.registerError = errorMessages.join(', ');
        } else {
          this.registerError = 'حدث خطأ أثناء إنشاء الحساب.';
        }
      }
    });
  }
}
