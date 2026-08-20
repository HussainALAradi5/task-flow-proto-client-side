import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { MessageType } from '../../../core/enums/message.enum';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed top-20 right-4 z-[100] space-y-3 w-96">
      @for (toast of toastService.toasts$(); track toast.id) {
        <div
          class="flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-lg animate-slide-in border-l-4"
          [class]="getClasses(toast.type)"
        >
          <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" [class]="getIconBg(toast.type)">
            @switch (toast.type) {
              @case (MessageType.SUCCESS) {
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              }
              @case (MessageType.ERROR) {
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
              @case (MessageType.WARNING) {
                <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              @default {
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            }
          </div>
          <span class="flex-1 text-sm font-medium" [class]="getTextColor(toast.type)">{{ toast.message }}</span>
          <button (click)="toastService.dismiss(toast.id)" class="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      animation: slide-in 0.3s ease-out forwards;
    }
  `],
})
export class ToastComponent {
  toastService = inject(ToastService);
  MessageType = MessageType;

  getClasses(type: MessageType): string {
    const map: Record<string, string> = {
      [MessageType.SUCCESS]: 'bg-green-50 border-green-500',
      [MessageType.ERROR]: 'bg-red-50 border-red-500',
      [MessageType.WARNING]: 'bg-yellow-50 border-yellow-500',
      [MessageType.INFO]: 'bg-blue-50 border-blue-500',
    };
    return map[type] || map[MessageType.INFO];
  }

  getIconBg(type: MessageType): string {
    const map: Record<string, string> = {
      [MessageType.SUCCESS]: 'bg-green-100',
      [MessageType.ERROR]: 'bg-red-100',
      [MessageType.WARNING]: 'bg-yellow-100',
      [MessageType.INFO]: 'bg-blue-100',
    };
    return map[type] || map[MessageType.INFO];
  }

  getTextColor(type: MessageType): string {
    const map: Record<string, string> = {
      [MessageType.SUCCESS]: 'text-green-800',
      [MessageType.ERROR]: 'text-red-800',
      [MessageType.WARNING]: 'text-yellow-800',
      [MessageType.INFO]: 'text-blue-800',
    };
    return map[type] || map[MessageType.INFO];
  }
}
