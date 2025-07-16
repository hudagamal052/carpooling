import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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
export class AuthComponent {
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

  @HostBinding('class.register-state') get registerStateClass() {
    return this.isRegisterState;
  }

  constructor(private authService: AuthService, private router: Router) { }

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
        this.router.navigate(['/']);
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
        this.registerSuccess = 'تم إنشاء الحساب بنجاح!';
        this.router.navigate(['/auth']);
        this.loginData.email = this.registerData.Email;
        this.loginData.password = this.registerData.Password;

      },
      error: (err) => {
        console.error('Registration error:', err);
        if (err.error && err.error.errors) {
          // Handle validation errors from backend
          const errorMessages = Object.values(err.error.errors).flat();
          this.registerError = errorMessages.join(', ');
        } else {
          this.registerError = 'حدث خطأ أثناء إنشاء الحساب.';
        }
      }
    });
  }
}