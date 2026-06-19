import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id:      number;
  type:    ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 0;
  private readonly DEFAULT_DURATION_MS = 4000;

  success(message: string, durationMs = this.DEFAULT_DURATION_MS): void {
    this.show('success', message, durationMs);
  }

  error(message: string, durationMs = this.DEFAULT_DURATION_MS): void {
    this.show('error', message, durationMs);
  }

  info(message: string, durationMs = this.DEFAULT_DURATION_MS): void {
    this.show('info', message, durationMs);
  }

  dismiss(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  private show(type: ToastType, message: string, durationMs: number): void {
    const id = this.nextId++;
    this._toasts.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }
}