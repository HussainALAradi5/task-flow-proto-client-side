import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { MessageType } from '../../../core/enums/message.enum';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      @for (toast of toastService.toasts$(); track toast.id) {
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-in backdrop-blur-sm"
          [class]="getClasses(toast.type)"
        >
          <span class="flex-shrink-0 w-5 h-5">
            @switch (toast.type) {
              @case (MessageType.SUCCESS) {
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              }
              @case (MessageType.ERROR) {
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
              @case (MessageType.WARNING) {
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              @default {
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            }
          </span>
          <span class="flex-1 text-sm font-medium">{{ toast.message }}</span>
          <button (click)="toastService.dismiss(toast.id)" class="flex-shrink-0 text-current opacity-70 hover:opacity-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `],
})
export class ToastComponent {
  toastService = inject(ToastService);
  MessageType = MessageType;

  getClasses(type: MessageType): string {
    const types: Record<string, string> = {
      [MessageType.SUCCESS]: 'bg-green-500/90 text-white',
      [MessageType.ERROR]: 'bg-red-500/90 text-white',
      [MessageType.WARNING]: 'bg-yellow-500/90 text-gray-900',
      [MessageType.INFO]: 'bg-blue-500/90 text-white',
    };
    return types[type];
  }
}
