import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface AccessUser {
  userId: string;
  userName: string;
  permission: 'read' | 'edit' | 'admin';
}

@Component({
  selector: 'app-generic-access-control',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <input
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
          class="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add people by name or email..."
        />
      </div>

      @if (suggestions().length > 0) {
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          @for (user of suggestions(); track user.userId) {
            <button
              (click)="addUser(user)"
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
            >
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span class="text-blue-600 dark:text-blue-400 font-medium text-xs">{{ user.userName.charAt(0) }}</span>
              </div>
              <span class="text-gray-900 dark:text-white">{{ user.userName }}</span>
            </button>
          }
        </div>
      }

      <div class="space-y-2">
        @for (user of users(); track user.userId) {
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span class="text-blue-600 dark:text-blue-400 font-medium text-xs">{{ user.userName.charAt(0) }}</span>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ user.userName }}</span>
            </div>
            <div class="flex items-center gap-2">
              <select
                [(ngModel)]="user.permission"
                (change)="onPermissionChange(user)"
                class="px-2 py-1 text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="read">Read</option>
                <option value="edit">Edit</option>
                <option value="admin">Admin</option>
              </select>
              <button (click)="removeUser(user)" class="text-gray-400 hover:text-red-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        } @empty {
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No people added yet</p>
        }
      </div>
    </div>
  `,
})
export class GenericAccessControlComponent {
  users = input.required<AccessUser[]>();
  onUsersChange = output<AccessUser[]>();

  searchQuery = '';
  suggestions = signal<AccessUser[]>([]);

  onSearch(): void {
    if (this.searchQuery.length < 2) {
      this.suggestions.set([]);
      return;
    }
    // Mock suggestions - in real app, call API
    this.suggestions.set([
      { userId: '1', userName: 'John Doe', permission: 'read' as const },
      { userId: '2', userName: 'Jane Smith', permission: 'read' as const },
    ].filter((u) => u.userName.toLowerCase().includes(this.searchQuery.toLowerCase())));
  }

  addUser(user: AccessUser): void {
    if (!this.users().find((u) => u.userId === user.userId)) {
      this.onUsersChange.emit([...this.users(), user]);
    }
    this.searchQuery = '';
    this.suggestions.set([]);
  }

  removeUser(user: AccessUser): void {
    this.onUsersChange.emit(this.users().filter((u) => u.userId !== user.userId));
  }

  onPermissionChange(user: AccessUser): void {
    this.onUsersChange.emit([...this.users()]);
  }
}
