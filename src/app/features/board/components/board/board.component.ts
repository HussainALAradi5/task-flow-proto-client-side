import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { AlertService } from '../../../../core/services/alert.service';
import { Project } from '../../../../core/models/project.model';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { GenericPaginationComponent } from '../../../../shared/components/generic-pagination/generic-pagination.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [FormsModule, DatePipe, GenericButtonComponent, GenericDialogComponent, GenericPaginationComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Manage your projects and tasks</p>
        </div>
        <app-generic-button (onClick)="openCreateDialog()">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </app-generic-button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (project of projects(); track project._id) {
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ project.title }}</h3>
                <div class="flex gap-2">
                  <button (click)="openEditDialog(project)" class="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button (click)="confirmDelete(project)" class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p class="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{{ project.description || 'No description' }}</p>
              <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <span class="text-xs text-gray-400">Created {{ project.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>
          } @empty {
            <div class="col-span-full text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 class="text-gray-900 dark:text-white font-medium mb-1">No projects yet</h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">Get started by creating your first project</p>
              <app-generic-button (onClick)="openCreateDialog()">Create Project</app-generic-button>
            </div>
          }
        </div>

        @if (pagination() && pagination()!.total > 9) {
          <div class="mt-6">
            <app-generic-pagination [meta]="pagination()!" (onPageChange)="loadProjects($event)" />
          </div>
        }
      }
    </div>

    <app-generic-dialog
      [isOpen]="showDialog()"
      [title]="editingProject() ? 'Edit Project' : 'New Project'"
      confirmText="Save"
      (onClose)="closeDialog()"
      (onConfirm)="saveProject()"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            [(ngModel)]="formData.title"
            class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Project title"
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
export class BoardComponent implements OnInit {
  private api = inject(ApiService);
  private alert = inject(AlertService);

  projects = signal<Project[]>([]);
  pagination = signal<any>(null);
  loading = signal(true);
  showDialog = signal(false);
  editingProject = signal<Project | null>(null);
  formData = { title: '', description: '' };

  ngOnInit(): void {
    this.loadProjects(1);
  }

  loadProjects(page: number): void {
    this.loading.set(true);
    this.api.getAll<Project>('projects', { page, limit: 9 }).subscribe({
      next: (res) => {
        this.projects.set(res.data);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreateDialog(): void {
    this.editingProject.set(null);
    this.formData = { title: '', description: '' };
    this.showDialog.set(true);
  }

  openEditDialog(project: Project): void {
    this.editingProject.set(project);
    this.formData = { title: project.title, description: project.description || '' };
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.editingProject.set(null);
  }

  saveProject(): void {
    if (this.editingProject()) {
      this.api.update('projects', this.editingProject()!._id, this.formData, 'Project updated').subscribe({
        next: () => {
          this.loadProjects(1);
          this.closeDialog();
        },
      });
    } else {
      this.api.create('projects', this.formData, 'Project created').subscribe({
        next: () => {
          this.loadProjects(1);
          this.closeDialog();
        },
      });
    }
  }

  confirmDelete(project: Project): void {
    this.alert.confirm(
      `Delete "${project.title}"? This action cannot be undone.`,
      () => {
        this.api.delete('projects', project._id, 'Project deleted').subscribe({
          next: () => this.loadProjects(1),
        });
      },
      'Delete Project',
    );
  }
}
