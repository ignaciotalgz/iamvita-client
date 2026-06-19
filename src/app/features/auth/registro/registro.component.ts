import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule,
         ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { RegistroRequest } from '../../../core/models/registro-request.model';
import { ApiError } from '../../../core/models/api-error.model';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass    = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  private readonly fb           = inject(FormBuilder);
  private readonly authService  = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router       = inject(Router);

  readonly isLoading    = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirm  = signal(false);

  readonly form = this.fb.group(
    {
      nombre:          ['', [Validators.required, Validators.minLength(2)]],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordsMatchValidator }
  );

  get nombre()          { return this.form.get('nombre')!;          }
  get email()           { return this.form.get('email')!;           }
  get password()        { return this.form.get('password')!;        }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  get passwordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') &&
           (this.confirmPassword.touched || this.confirmPassword.dirty);
  }

  togglePassword(): void { this.showPassword.update(v => !v); }
  toggleConfirm():  void { this.showConfirm.update(v => !v);  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { nombre, email, password } = this.form.getRawValue();
    const payload: RegistroRequest = { nombre: nombre!, email: email!, password: password! };

    this.authService.registro(payload).subscribe({
      next: () => {
        this.toastService.success('Cuenta creada con éxito. Iniciá sesión para continuar.');
        this.router.navigate(['/auth/login']);
      },
      error: (err: HttpErrorResponse) => {
        const apiError = err.error as ApiError;
        this.toastService.error(apiError?.mensaje ?? 'Error al registrarse. Intentá de nuevo.');
        this.isLoading.set(false);
      }
    });
  }
}