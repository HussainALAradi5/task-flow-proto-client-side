import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { AlertService } from '../../../../core/services/alert.service';
import { Team } from '../../../../core/models/team.model';
import { PaginationMeta } from '../../../../core/interfaces/base.interface';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { GenericPaginationComponent } from '../../../../shared/components/generic-pagination/generic-pagination.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [FormsModule, DatePipe, GenericButtonComponent, GenericDialogComponent, GenericPaginationComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Manage your teams</p>
        </div>
        <app-generic-button (onClick)="openCreateDialog()">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Team
        </app-generic-button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (team of teams(); track team._id) {
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ team.name }}</h3>
                <div class="flex gap-2">
                  <button (click)="openEditDialog(team)" class="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button (click)="confirmDelete(team)" class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p class="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{{ team.description || 'No description' }}</p>
              <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <span class="text-xs text-gray-400">Created {{ team.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>
          } @empty {
            <div class="col-span-full text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 class="text-gray-900 dark:text-white font-medium mb-1">No teams yet</h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">Create a team to collaborate with others</p>
              <app-generic-button (onClick)="openCreateDialog()">Create Team</app-generic-button>
            </div>
          }
        </div>

        @if (pagination() && pagination()!.total > 9) {
          <div class="mt-6">
            <app-generic-pagination [meta]="pagination()!" (onPageChange)="loadTeams($event)" />
          </div>
        }
      }
    </div>

    <app-generic-dialog
      [isOpen]="showDialog()"
      [title]="editingTeam() ? 'Edit Team' : 'New Team'"
      confirmText="Save"
      (onClose)="closeDialog()"
      (onConfirm)="saveTeam()"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input
            [(ngModel)]="formData.name"
            class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Team name"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            [(ngModel)]="formData.description"
            rows="3"
            class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Optional description"
          ></textarea>
        </div>
      </div>
    </app-generic-dialog>
  `,
})
export class TeamComponent implements OnInit {
  private api = inject(ApiService);
  private alert = inject(AlertService);

  teams = signal<Team[]>([]);
  pagination = signal<PaginationMeta | null>(null);
  loading = signal(true);
  showDialog = signal(false);
  editingTeam = signal<Team | null>(null);
  formData = { name: '', description: '' };

  ngOnInit(): void {
    this.loadTeams(1);
  }

  loadTeams(page: number): void {
    this.loading.set(true);
    this.api.getAll<Team>('teams', { page, limit: 9 }).subscribe({
      next: (res) => {
        this.teams.set(res.data);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreateDialog(): void {
    this.editingTeam.set(null);
    this.formData = { name: '', description: '' };
    this.showDialog.set(true);
  }

  openEditDialog(team: Team): void {
    this.editingTeam.set(team);
    this.formData = { name: team.name, description: team.description || '' };
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.editingTeam.set(null);
  }

  saveTeam(): void {
    if (this.editingTeam()) {
      this.api.update('teams', this.editingTeam()!._id, this.formData, 'Team updated').subscribe({
        next: () => {
          this.loadTeams(1);
          this.closeDialog();
        },
      });
    } else {
      this.api.create('teams', this.formData, 'Team created').subscribe({
        next: () => {
          this.loadTeams(1);
          this.closeDialog();
        },
      });
    }
  }

  confirmDelete(team: Team): void {
    this.alert.confirm(
      `Delete "${team.name}"? This action cannot be undone.`,
      () => {
        this.api.delete('teams', team._id, 'Team deleted').subscribe({
          next: () => this.loadTeams(1),
        });
      },
      'Delete Team',
    );
  }
}
