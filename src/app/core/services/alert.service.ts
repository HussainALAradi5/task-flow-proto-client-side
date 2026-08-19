import { Injectable, signal } from '@angular/core';
import { MessageType } from '../enums/message.enum';
import { Alert } from '../models/toast.model';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alert = signal<Alert | null>(null);
  readonly alert$ = this.alert.asReadonly();

  show(options: Omit<Alert, 'id'>): void {
    this.alert.set({ ...options, id: crypto.randomUUID() });
  }

  confirm(message: string, onConfirm: () => void, title?: string): void {
    this.show({
      title: title || 'Confirm',
      message,
      type: MessageType.WARNING,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm,
    });
  }

  success(message: string, title?: string): void {
    this.show({ title: title || 'Success', message, type: MessageType.SUCCESS });
  }

  error(message: string, title?: string): void {
    this.show({ title: title || 'Error', message, type: MessageType.ERROR });
  }

  dismiss(): void {
    this.alert.set(null);
  }
}
