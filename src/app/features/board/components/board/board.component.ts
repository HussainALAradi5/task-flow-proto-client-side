import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { Project } from '../../../../core/models/project.model';
import { PaginatedResult } from '../../../../core/models/pagination.model';
import { GenericCardComponent } from '../../../../shared/components/generic-card/generic-card.component';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericPaginationComponent } from '../../../../shared/components/generic-pagination/generic-pagination.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [GenericCardComponent, GenericButtonComponent, GenericPaginationComponent],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">My Projects</h1>
        <app-generic-button (onClick)="showCreateDialog.set(true)">
          New Project
        </app-generic-button>
      </div>

      @if (loading()) {
        <div class="text-center py-12">
          <p class="text-gray-500">Loading projects...</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (project of projects(); track project._id) {
            <app-generic-card
              [title]="project.title"
              [subtitle]="project.description || 'No description'"
              [showActions]="true"
              (onEdit)="editProject(project)"
              (onDelete)="deleteProject(project)"
            />
          } @empty {
            <div class="col-span-full text-center py-12">
              <p class="text-gray-500">No projects found</p>
            </div>
          }
        </div>

        @if (pagination()) {
          <app-generic-pagination
            [meta]="pagination()!"
            (onPageChange)="loadProjects($event)"
          />
        }
      }
    </div>
  `,
})
export class BoardComponent implements OnInit {
  private api = inject(ApiService);

  projects = signal<Project[]>([]);
  pagination = signal<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  loading = signal(true);
  showCreateDialog = signal(false);

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
      error: () => {
        this.loading.set(false);
      },
    });
  }

  editProject(project: Project): void {
    console.log('Edit project:', project);
  }

  deleteProject(project: Project): void {
    console.log('Delete project:', project);
  }
}
