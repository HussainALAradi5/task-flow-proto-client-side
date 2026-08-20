import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, GenericButtonComponent],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

      @if (authService.currentUser(); as user) {
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div class="flex items-center gap-6 mb-8">
            <div class="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span class="text-blue-600 dark:text-blue-400 font-bold text-2xl">{{ user.userName.charAt(0).toUpperCase() }}</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ user.userName }}</h2>
              <p class="text-gray-500 dark:text-gray-400">{{ user.email }}</p>
              <span class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full" [class]="getRoleBadge(user.role)">
                {{ user.role }}
              </span>
            </div>
          </div>

          <form (submit)="onSubmit($event)" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                [(ngModel)]="formData.userName"
                name="userName"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                [(ngModel)]="formData.email"
                name="email"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
              <input
                type="tel"
                [(ngModel)]="formData.mobileNumber"
                name="mobileNumber"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div class="flex gap-3">
              <app-generic-button type="submit" [loading]="loading()">
                Save Changes
              </app-generic-button>
              <app-generic-button variant="ghost" (onClick)="resetForm()">
                Reset
              </app-generic-button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class ProfileComponent {
  authService = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(false);
  formData = { userName: '', email: '', mobileNumber: '' };

  constructor() {
    const user = this.authService.currentUser();
    if (user) {
      this.formData = {
        userName: user.userName,
        email: user.email,
        mobileNumber: user.mobileNumber || '',
      };
    }
  }

  getRoleBadge(role: string): string {
    const badges: Record<string, string> = {
      Admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Leader: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Member: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return badges[role] || badges['Member'];
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.loading.set(true);

    this.authService.updateProfile(this.formData).subscribe({
      next: () => {
        this.toast.success('Profile updated');
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  resetForm(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.formData = {
        userName: user.userName,
        email: user.email,
        mobileNumber: user.mobileNumber || '',
      };
    }
  }
}
