import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { AlertService } from '../../../../core/services/alert.service';
import { Project } from '../../../../core/interfaces/project.interface';
import { Task } from '../../../../core/interfaces/task.interface';
import { Milestone } from '../../../../core/interfaces/milestone.interface';
import { TaskStatus, TASK_STATUS_OPTIONS } from '../../../../core/enums/task-status.enum';
import { TaskPriority, TASK_PRIORITY_OPTIONS } from '../../../../core/enums/task-priority.enum';
import { SelectOption } from '../../../../shared/components/generic-select/generic-select.component';
import { BadgeOption } from '../../../../shared/components/generic-badge-select/generic-badge-select.component';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { GenericBadgeComponent } from '../../../../shared/components/generic-badge/generic-badge.component';
import { GenericSelectComponent } from '../../../../shared/components/generic-select/generic-select.component';
import { GenericBadgeSelectComponent } from '../../../../shared/components/generic-badge-select/generic-badge-select.component';

interface TaskForm {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  milestoneId: string;
}

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, GenericButtonComponent, GenericDialogComponent, GenericBadgeComponent, GenericSelectComponent, GenericBadgeSelectComponent],
  templateUrl: './project-detail.component.html',
})
export class ProjectDetailComponent implements OnInit {
  private api = inject(ApiService);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  milestones = signal<Milestone[]>([]);
  projectId = '';

  columns = [
    { status: TaskStatus.TODO, label: 'To Do', dotColor: 'bg-gray-400' },
    { status: TaskStatus.IN_PROGRESS, label: 'In Progress', dotColor: 'bg-blue-500' },
    { status: TaskStatus.IN_REVIEW, label: 'In Review', dotColor: 'bg-yellow-500' },
    { status: TaskStatus.DONE, label: 'Done', dotColor: 'bg-green-500' },
  ];

  statusBadgeOptions: BadgeOption[] = TASK_STATUS_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
    selectedClass: `${o.badge} border-2 border-current`,
    unselectedClass: `bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200`,
  }));

  priorityBadgeOptions: BadgeOption[] = TASK_PRIORITY_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
    selectedClass: `${o.badge} border-2 border-current`,
    unselectedClass: `bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200`,
  }));

  milestoneSelectOptions: SelectOption[] = [];

  showTaskDialog = signal(false);
  showMilestoneDialog = signal(false);
  editingTask = signal<Task | null>(null);
  editingMilestone = signal<Milestone | null>(null);
  draggedTask = signal<Task | null>(null);
  taskSearch = '';

  taskForm: TaskForm = { title: '', description: '', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, milestoneId: '' };
  milestoneForm = { name: '' };

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('projectCode') || '';
    this.loadProject(code);
  }

  loadProject(code: string): void {
    this.api.getAll<Project>('projects').subscribe({
      next: (res) => {
        const found = res.data.find((p) => p.code === code || p.slug === code);
        if (found) {
          this.project.set(found);
          this.projectId = found._id;
          this.loadTasks();
          this.loadMilestones();
        }
      },
    });
  }

  loadTasks(): void {
    this.api.getAll<Task>(`tasks/project/${this.projectId}`).subscribe({ next: (res) => this.tasks.set(res.data) });
  }

  loadMilestones(): void {
    this.api.getAll<Milestone>(`milestones/project/${this.projectId}`).subscribe({
      next: (res) => {
        this.milestones.set(res.data);
        this.milestoneSelectOptions = res.data.map((m) => ({ value: m._id, label: m.name }));
      },
    });
  }

  getByStatus(status: TaskStatus): Task[] {
    const tasks = this.taskSearch
      ? this.tasks().filter((t) => t.title.toLowerCase().includes(this.taskSearch.toLowerCase()))
      : this.tasks();
    return tasks.filter((t) => t.status === status);
  }

  getCount(status: TaskStatus): number {
    return this.getByStatus(status).length;
  }

  getMilestoneName(id?: string): string {
    if (!id) return '';
    return this.milestones().find((m) => m._id === id)?.name || '';
  }

  getPriorityVariant(p: TaskPriority): 'success' | 'warning' | 'danger' | 'info' {
    const map: Record<TaskPriority, 'success' | 'warning' | 'danger' | 'info'> = {
      [TaskPriority.LOW]: 'info', [TaskPriority.MEDIUM]: 'success', [TaskPriority.HIGH]: 'warning', [TaskPriority.CRITICAL]: 'danger',
    };
    return map[p];
  }

  onDragStart(event: DragEvent, task: Task): void {
    this.draggedTask.set(task);
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDragLeave(_event: DragEvent): void {}

  onDrop(event: DragEvent, newStatus: TaskStatus): void {
    event.preventDefault();
    const task = this.draggedTask();
    if (task && task.status !== newStatus) {
      this.api.update('tasks', task._id, { status: newStatus }, 'Task moved').subscribe({
        next: () => this.tasks.update((ts) => ts.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))),
      });
    }
    this.draggedTask.set(null);
  }

  onStatusChange(value: string): void {
    this.taskForm.status = value as TaskStatus;
  }

  onPriorityChange(value: string): void {
    this.taskForm.priority = value as TaskPriority;
  }

  openCreateTask(): void {
    this.editingTask.set(null);
    this.taskForm = { title: '', description: '', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, milestoneId: '' };
    this.showTaskDialog.set(true);
  }

  openEditTask(task: Task): void {
    this.editingTask.set(task);
    this.taskForm = { title: task.title, description: task.description || '', status: task.status, priority: task.priority, milestoneId: task.milestoneId || '' };
    this.showTaskDialog.set(true);
  }

  closeTaskDialog(): void {
    this.showTaskDialog.set(false);
    this.editingTask.set(null);
  }

  saveTask(): void {
    const data: Record<string, unknown> = { ...this.taskForm, projectId: this.projectId };
    const obs = this.editingTask()
      ? this.api.update('tasks', this.editingTask()!._id, data, 'Task updated')
      : this.api.create('tasks', data, 'Task created');
    obs.subscribe({ next: () => { this.loadTasks(); this.closeTaskDialog(); } });
  }

  confirmDeleteTask(task: Task): void {
    this.alert.confirm(`Delete "${task.title}"?`, () => {
      this.api.delete('tasks', task._id, 'Task deleted').subscribe({ next: () => this.loadTasks() });
    }, 'Delete Task');
  }

  openEditMilestone(m: Milestone): void {
    this.editingMilestone.set(m);
    this.milestoneForm = { name: m.name };
    this.showMilestoneDialog.set(true);
  }

  closeMilestoneDialog(): void {
    this.showMilestoneDialog.set(false);
    this.editingMilestone.set(null);
  }

  saveMilestone(): void {
    const data: Record<string, unknown> = { ...this.milestoneForm, projectId: this.projectId };
    const obs = this.editingMilestone()
      ? this.api.update('milestones', this.editingMilestone()!._id, data, 'Milestone updated')
      : this.api.create('milestones', data, 'Milestone created');
    obs.subscribe({ next: () => { this.loadMilestones(); this.closeMilestoneDialog(); } });
  }

  confirmDeleteMilestone(m: Milestone): void {
    this.alert.confirm(`Delete "${m.name}"?`, () => {
      this.api.delete('milestones', m._id, 'Milestone deleted').subscribe({ next: () => this.loadMilestones() });
    }, 'Delete Milestone');
  }
}
