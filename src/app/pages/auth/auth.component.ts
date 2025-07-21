import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginData } from '../../models/login.model';
import { RegisterData } from '../../models/register.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  isRegisterState = false;
  loginData: LoginData = { email: '', password: '' };
  registerData: RegisterData = { Name: '', Email: '', Password: '', ConfirmPassword: '', PhoneNumber: '', Gender: 0 };
  loginError: string = '';
  registerError: string = '';
  registerSuccess: string = '';
  private returnUrl: string = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  toggleState(): void {
    this.isRegisterState = !this.isRegisterState;
    // إعادة تعيين رسائل الخطأ والنجاح عند التبديل
    this.loginError = '';
    this.registerError = '';
    this.registerSuccess = '';
  }

  onLoginSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.loginError = '';
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: (err) => {
        this.loginError = 'فشل تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور.';
        console.error(err);
      },
    });
  }

  onRegisterSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    if (this.registerData.Password !== this.registerData.ConfirmPassword) {
      this.registerError = 'كلمتا المرور غير متطابقتين.';
      return;
    }
    this.registerError = '';
    this.registerSuccess = '';

    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        this.registerSuccess = 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.';
        // الانتقال إلى واجهة تسجيل الدخول بعد ثانيتين
        setTimeout(() => {
          this.toggleState();
          // ملء البريد الإلكتروني للمستخدم لتسهيل تسجيل الدخول
          this.loginData.email = this.registerData.Email;
          this.loginData.password = '';
        }, 2000);
      },
      error: (err) => {
        console.error('Registration error:', err);
        if (err.error && err.error.errors) {
          const errorMessages = Object.values(err.error.errors).flat();
          this.registerError = errorMessages.join(' \n ');
        } else {
          this.registerError = 'حدث خطأ أثناء إنشاء الحساب. قد يكون البريد الإلكتروني مستخدمًا بالفعل.';
        }
      },
    });
  }
}
