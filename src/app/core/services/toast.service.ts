import { Injectable, signal } from '@angular/core';
import { MessageType } from '../enums/message.enum';
import { Toast } from '../models/toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = signal<Toast[]>([]);
  readonly toasts$ = this.toasts.asReadonly();

  show(message: string, type: MessageType = MessageType.INFO, duration = 3000): void {
    const id = crypto.randomUUID();
    const toast: Toast = { id, message, type, duration };
    this.toasts.update((t) => [...t, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, MessageType.SUCCESS, duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, MessageType.ERROR, duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, MessageType.WARNING, duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, MessageType.INFO, duration);
  }

  dismiss(id: string): void {
    this.toasts.update((t) => t.filter((toast) => toast.id !== id));
  }
}
