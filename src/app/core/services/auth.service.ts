// src/app/core/services/auth.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth-response.model';
import { LoginRequest } from '../models/login-request.model';
import { RegistroRequest } from '../models/registro-request.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API_URL   = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'iamvita_auth';

  // ─── Estado reactivo con Signals ───────────────────────────
  private readonly _session = signal<AuthResponse | null>(this.restoreSession());

  readonly session         = this._session.asReadonly();
  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly currentUser     = computed(() => this._session());

  // ─── API pública ───────────────────────────────────────────

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, payload).pipe(
      tap(res => this.persistSession(res))
    );
  }

  registro(payload: RegistroRequest): Observable<AuthResponse> {
    // return this.http.post<AuthResponse>(`${this.API_URL}/registro`, payload).pipe(
    //   tap(res => this.persistSession(res))
    // );
    return this.http.post<AuthResponse>(`${this.API_URL}/registro`, payload);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._session.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this._session()?.token ?? null;
  }

  // ─── Internos ──────────────────────────────────────────────

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(response));
    this._session.set(response);
  }

  private restoreSession(): AuthResponse | null {
    const raw = localStorage.getItem(this.TOKEN_KEY);
    if (!raw) return null;

    try {
      const session: AuthResponse = JSON.parse(raw);
      // Descartar si el JWT ya expiró (evita requests que van a fallar con 401)
      if (this.isJwtExpired(session.token)) {
        localStorage.removeItem(this.TOKEN_KEY);
        return null;
      }
      return session;
    } catch {
      localStorage.removeItem(this.TOKEN_KEY);
      return null;
    }
  }

  private isJwtExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp está en segundos, Date.now() en milisegundos
      return Date.now() >= payload['exp'] * 1000;
    } catch {
      return true;
    }
  }
}