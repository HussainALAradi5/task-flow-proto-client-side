import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { AlertService } from '../../../../core/services/alert.service';
import { Project } from '../../../../core/interfaces/project.interface';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { GenericPaginationComponent } from '../../../../shared/components/generic-pagination/generic-pagination.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, GenericButtonComponent, GenericDialogComponent, GenericPaginationComponent],
  templateUrl: './board.component.html',
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
      next: (res) => { this.projects.set(res.data); this.pagination.set(res.pagination); this.loading.set(false); },
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
    const obs = this.editingProject()
      ? this.api.update('projects', this.editingProject()!._id, this.formData, 'Project updated')
      : this.api.create('projects', this.formData, 'Project created');
    obs.subscribe({ next: () => { this.loadProjects(1); this.closeDialog(); } });
  }

  confirmDelete(project: Project): void {
    this.alert.confirm(`Delete "${project.title}"?`, () => {
      this.api.delete('projects', project._id, 'Project deleted').subscribe({ next: () => this.loadProjects(1) });
    }, 'Delete Project');
  }
}
