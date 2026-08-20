import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, GenericButtonComponent, GenericDialogComponent],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

      @if (authService.currentUser(); as user) {
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <!-- Profile Info (Readonly) -->
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

          <div class="space-y-4 mb-6">
            <div class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">Username</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ user.userName }}</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">Email</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ user.email }}</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">Mobile</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ user.mobileNumber || 'Not set' }}</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">Role</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ user.role }}</span>
            </div>
          </div>

          <app-generic-button (onClick)="openEditDialog()">Edit Profile</app-generic-button>
        </div>
      }
    </div>

    <!-- Edit Dialog -->
    <app-generic-dialog
      [isOpen]="showEditDialog()"
      title="Edit Profile"
      confirmText="Save"
      (onClose)="closeEditDialog()"
      (onConfirm)="saveProfile()"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
          <input [(ngModel)]="formData.userName" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input [(ngModel)]="formData.email" type="email" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
          <input [(ngModel)]="formData.mobileNumber" type="tel" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
    </app-generic-dialog>
  `,
})
export class ProfileComponent {
  authService = inject(AuthService);
  showEditDialog = signal(false);
  formData = { userName: '', email: '', mobileNumber: '' };

  getRoleBadge(role: string): string {
    const badges: Record<string, string> = {
      Admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Leader: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Member: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return badges[role] || badges['Member'];
  }

  openEditDialog(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.formData = { userName: user.userName, email: user.email, mobileNumber: user.mobileNumber || '' };
    }
    this.showEditDialog.set(true);
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
  }

  saveProfile(): void {
    this.authService.updateProfile(this.formData).subscribe({
      next: () => this.closeEditDialog(),
    });
  }
}
