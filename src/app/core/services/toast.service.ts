import { Injectable, signal } from '@angular/core';
import { MessageType } from '../enums/message.enum';

export interface Toast {
  id: string;
  message: string;
  type: MessageType;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = signal<Toast[]>([]);
  readonly toasts$ = this.toasts.asReadonly();

  show(message: string, type: MessageType = MessageType.INFO, duration = 4000): void {
    const id = crypto.randomUUID();
    const toast: Toast = { id, message, type, duration };
    this.toasts.update((t) => [...t, toast]);

    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void {
    this.show(message, MessageType.SUCCESS);
  }

  error(message: string): void {
    this.show(message, MessageType.ERROR, 5000);
  }

  warning(message: string): void {
    this.show(message, MessageType.WARNING, 5000);
  }

  info(message: string): void {
    this.show(message, MessageType.INFO);
  }

  dismiss(id: string): void {
    this.toasts.update((t) => t.filter((toast) => toast.id !== id));
  }

  dismissAll(): void {
    this.toasts.set([]);
  }
}
