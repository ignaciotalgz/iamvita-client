import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/login-request.model';
import { ApiError } from '../../../core/models/api-error.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  readonly isLoading    = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  get email()    { return this.form.get('email')!;    }
  get password() { return this.form.get('password')!; }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;
    this.form.markAllAsTouched();

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.form.getRawValue() as LoginRequest).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: HttpErrorResponse) => {
        const apiError = err.error as ApiError;
        this.errorMessage.set(apiError?.mensaje ?? 'Error al iniciar sesión. Intentá de nuevo.');
        this.isLoading.set(false);
      }
    });
  }
}