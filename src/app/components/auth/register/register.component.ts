import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0-9]{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['passenger', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    const userData = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading = false;
        const role = userData.role;
        this.router.navigate([role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'حدث خطأ أثناء التسجيل. حاول مرة أخرى.';
      }
    });
  }
}
