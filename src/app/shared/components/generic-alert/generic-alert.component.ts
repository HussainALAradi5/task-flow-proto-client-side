import { Component, inject } from '@angular/core';
import { AlertService } from '../../../core/services/alert.service';
import { MessageType } from '../../../core/enums/message.enum';
import { GenericButtonComponent } from '../generic-button/generic-button.component';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [GenericButtonComponent],
  template: `
    @if (alertService.alert$(); as alert) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" (click)="alertService.dismiss()"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" [class]="getIconClasses(alert.type)">
                @switch (alert.type) {
                  @case (MessageType.SUCCESS) {
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  }
                  @case (MessageType.ERROR) {
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                  @case (MessageType.WARNING) {
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                  @default {
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                }
              </div>
              <div class="flex-1">
                @if (alert.title) {
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ alert.title }}</h3>
                }
                <p class="text-gray-600 dark:text-gray-300 text-sm">{{ alert.message }}</p>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
            @if (alert.cancelText) {
              <app-generic-button variant="ghost" (onClick)="onCancel()">
                {{ alert.cancelText }}
              </app-generic-button>
            }
            @if (alert.confirmText) {
              <app-generic-button [color]="getButtonColor(alert.type)" (onClick)="onConfirm()">
                {{ alert.confirmText }}
              </app-generic-button>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class AlertComponent {
  alertService = inject(AlertService);
  MessageType = MessageType;

  getIconClasses(type: MessageType): string {
    const types: Record<string, string> = {
      [MessageType.SUCCESS]: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      [MessageType.ERROR]: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      [MessageType.WARNING]: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      [MessageType.INFO]: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return types[type];
  }

  getButtonColor(type: MessageType): 'success' | 'danger' | 'warning' | 'primary' {
    const types: Record<string, 'success' | 'danger' | 'warning' | 'primary'> = {
      [MessageType.SUCCESS]: 'success',
      [MessageType.ERROR]: 'danger',
      [MessageType.WARNING]: 'warning',
      [MessageType.INFO]: 'primary',
    };
    return types[type];
  }

  onConfirm(): void {
    const alert = this.alertService.alert$();
    alert?.onConfirm?.();
    this.alertService.dismiss();
  }

  onCancel(): void {
    const alert = this.alertService.alert$();
    alert?.onCancel?.();
    this.alertService.dismiss();
  }
}
