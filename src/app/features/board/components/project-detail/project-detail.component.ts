import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { AlertService } from '../../../../core/services/alert.service';
import { Project } from '../../../../core/models/project.model';
import { Task, TaskStatus, TaskPriority } from '../../../../core/models/task.model';
import { Milestone } from '../../../../core/models/milestone.model';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { GenericBadgeComponent } from '../../../../shared/components/generic-badge/generic-badge.component';
import { GenericSelectComponent, SelectOption } from '../../../../shared/components/generic-select/generic-select.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, GenericButtonComponent, GenericDialogComponent, GenericBadgeComponent, GenericSelectComponent],
  template: `
    <div class="p-6 max-w-full mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <a routerLink="/board" class="text-sm text-blue-600 hover:underline mb-1 inline-block">&larr; Back to Projects</a>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ project()?.title || 'Project' }}</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">{{ project()?.description }}</p>
        </div>
        <div class="flex gap-2">
          <app-generic-button variant="outline" (onClick)="showMilestoneDialog.set(true)">+ Milestone</app-generic-button>
          <app-generic-button (onClick)="showTaskDialog.set(true)">+ Task</app-generic-button>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="flex gap-4 overflow-x-auto pb-4">
        @for (status of statusOptions; track status.value) {
          <div class="flex-shrink-0 w-72 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 min-h-[300px]"
            (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" (drop)="onDrop($event, status.value)">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" [class]="status.color"></span>
                <h3 class="font-semibold text-gray-700 dark:text-gray-300 text-sm">{{ status.label }}</h3>
              </div>
              <span class="text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {{ getTasksByStatus(status.value).length }}
              </span>
            </div>
            <div class="space-y-3">
              @for (task of getTasksByStatus(status.value); track task._id) {
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 cursor-grab hover:shadow-md transition-shadow"
                  draggable="true" (dragstart)="onDragStart($event, task)" (click)="openEditTask(task)">
                  <div class="flex items-start justify-between mb-2">
                    <h4 class="font-medium text-gray-900 dark:text-white text-sm">{{ task.title }}</h4>
                    <button (click)="confirmDeleteTask(task); $event.stopPropagation()" class="text-gray-400 hover:text-red-500">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  @if (task.description) {
                    <p class="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-2">{{ task.description }}</p>
                  }
                  <app-generic-badge [variant]="getPriorityVariant(task.priority)">{{ task.priority }}</app-generic-badge>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Milestones -->
      @if (milestones().length > 0) {
        <div class="mt-8">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Milestones</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (milestone of milestones(); track milestone._id) {
              <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div class="flex justify-between items-start">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ milestone.name }}</h4>
                  <div class="flex gap-1">
                    <button (click)="openEditMilestone(milestone)" class="p-1 text-gray-400 hover:text-blue-500">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button (click)="confirmDeleteMilestone(milestone)" class="p-1 text-gray-400 hover:text-red-500">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Task Dialog -->
    <app-generic-dialog [isOpen]="showTaskDialog()" [title]="editingTask() ? 'Edit Task' : 'New Task'" confirmText="Save" (onClose)="closeTaskDialog()" (onConfirm)="saveTask()">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input [(ngModel)]="taskForm.title" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Task title" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea [(ngModel)]="taskForm.description" rows="2" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Optional"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <app-generic-select label="Status" [options]="statusOptions" [value]="taskForm.status" (valueChange)="taskForm.status = $event" />
          <app-generic-select label="Priority" [options]="priorityOptions" [value]="taskForm.priority" (valueChange)="taskForm.priority = $event" />
        </div>
        <app-generic-select label="Milestone" [options]="milestoneOptions()" [value]="taskForm.milestoneId" (valueChange)="taskForm.milestoneId = $event" placeholder="None" />
      </div>
    </app-generic-dialog>

    <!-- Milestone Dialog -->
    <app-generic-dialog [isOpen]="showMilestoneDialog()" [title]="editingMilestone() ? 'Edit Milestone' : 'New Milestone'" confirmText="Save" (onClose)="closeMilestoneDialog()" (onConfirm)="saveMilestone()">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
        <input [(ngModel)]="milestoneForm.name" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Milestone name" />
      </div>
    </app-generic-dialog>
  `,
})
export class ProjectDetailComponent implements OnInit {
  private api = inject(ApiService);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  milestones = signal<Milestone[]>([]);
  projectId = '';

  statusOptions: SelectOption[] = [
    { value: TaskStatus.TODO, label: 'To Do', color: 'bg-gray-400' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-500' },
    { value: TaskStatus.IN_REVIEW, label: 'In Review', color: 'bg-yellow-500' },
    { value: TaskStatus.DONE, label: 'Done', color: 'bg-green-500' },
  ];

  priorityOptions: SelectOption[] = [
    { value: TaskPriority.LOW, label: 'Low', color: 'bg-blue-400' },
    { value: TaskPriority.MEDIUM, label: 'Medium', color: 'bg-green-400' },
    { value: TaskPriority.HIGH, label: 'High', color: 'bg-yellow-400' },
    { value: TaskPriority.CRITICAL, label: 'Critical', color: 'bg-red-400' },
  ];

  showTaskDialog = signal(false);
  showMilestoneDialog = signal(false);
  editingTask = signal<Task | null>(null);
  editingMilestone = signal<Milestone | null>(null);
  draggedTask = signal<Task | null>(null);

  taskForm: any = { title: '', description: '', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, milestoneId: '' };
  milestoneForm = { name: '' };

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
    this.loadProject();
    this.loadTasks();
    this.loadMilestones();
  }

  loadProject(): void {
    this.api.getById<Project>('projects', this.projectId).subscribe({ next: (res) => this.project.set(res.data) });
  }

  loadTasks(): void {
    this.api.getAll<Task>(`tasks/project/${this.projectId}`).subscribe({ next: (res) => this.tasks.set(res.data) });
  }

  loadMilestones(): void {
    this.api.getAll<Milestone>(`milestones/project/${this.projectId}`).subscribe({ next: (res) => this.milestones.set(res.data) });
  }

  getTasksByStatus(status: string): Task[] {
    return this.tasks().filter((t) => t.status === status);
  }

  getPriorityVariant(priority: TaskPriority): 'success' | 'warning' | 'danger' | 'info' {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      [TaskPriority.LOW]: 'info', [TaskPriority.MEDIUM]: 'success', [TaskPriority.HIGH]: 'warning', [TaskPriority.CRITICAL]: 'danger',
    };
    return map[priority] || 'info';
  }

  milestoneOptions = signal<SelectOption[]>([]);

  // Drag & Drop
  onDragStart(event: DragEvent, task: Task): void {
    this.draggedTask.set(task);
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); event.dataTransfer!.dropEffect = 'move'; }
  onDragLeave(_event: DragEvent): void {}

  onDrop(event: DragEvent, newStatus: string): void {
    event.preventDefault();
    const task = this.draggedTask();
    if (task && task.status !== newStatus) {
      this.api.update('tasks', task._id, { status: newStatus } as any, 'Task moved').subscribe({
        next: () => this.tasks.update((tasks) => tasks.map((t) => (t._id === task._id ? { ...t, status: newStatus as TaskStatus } : t))),
      });
    }
    this.draggedTask.set(null);
  }

  // Task CRUD
  openEditTask(task: Task): void {
    this.editingTask.set(task);
    this.taskForm = { title: task.title, description: task.description || '', status: task.status, priority: task.priority, milestoneId: task.milestoneId || '' };
    this.updateMilestoneOptions();
    this.showTaskDialog.set(true);
  }

  closeTaskDialog(): void {
    this.showTaskDialog.set(false);
    this.editingTask.set(null);
    this.taskForm = { title: '', description: '', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, milestoneId: '' };
  }

  saveTask(): void {
    const data = { ...this.taskForm, projectId: this.projectId };
    if (this.editingTask()) {
      this.api.update('tasks', this.editingTask()!._id, data, 'Task updated').subscribe({ next: () => { this.loadTasks(); this.closeTaskDialog(); } });
    } else {
      this.api.create('tasks', data, 'Task created').subscribe({ next: () => { this.loadTasks(); this.closeTaskDialog(); } });
    }
  }

  confirmDeleteTask(task: Task): void {
    this.alert.confirm(`Delete "${task.title}"?`, () => {
      this.api.delete('tasks', task._id, 'Task deleted').subscribe({ next: () => this.loadTasks() });
    }, 'Delete Task');
  }

  // Milestone CRUD
  updateMilestoneOptions(): void {
    this.milestoneOptions.set(this.milestones().map((m) => ({ value: m._id, label: m.name })));
  }

  openEditMilestone(milestone: Milestone): void {
    this.editingMilestone.set(milestone);
    this.milestoneForm = { name: milestone.name };
    this.showMilestoneDialog.set(true);
  }

  closeMilestoneDialog(): void {
    this.showMilestoneDialog.set(false);
    this.editingMilestone.set(null);
    this.milestoneForm = { name: '' };
  }

  saveMilestone(): void {
    const data = { ...this.milestoneForm, projectId: this.projectId };
    if (this.editingMilestone()) {
      this.api.update('milestones', this.editingMilestone()!._id, data, 'Milestone updated').subscribe({ next: () => { this.loadMilestones(); this.closeMilestoneDialog(); } });
    } else {
      this.api.create('milestones', data, 'Milestone created').subscribe({ next: () => { this.loadMilestones(); this.closeMilestoneDialog(); } });
    }
  }

  confirmDeleteMilestone(milestone: Milestone): void {
    this.alert.confirm(`Delete "${milestone.name}"?`, () => {
      this.api.delete('milestones', milestone._id, 'Milestone deleted').subscribe({ next: () => this.loadMilestones() });
    }, 'Delete Milestone');
  }
}
