import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.errorMessage = '';
    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.loading = false;
        const path = user.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard';
        this.router.navigate([path]);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'فشل تسجيل الدخول، تحقق من البيانات.';
      }
    });
  }
}
