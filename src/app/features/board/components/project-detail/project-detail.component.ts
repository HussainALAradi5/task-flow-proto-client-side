import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { FilterService } from '../../../../core/services/filter.service';
import { AlertService } from '../../../../core/services/alert.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Project } from '../../../../core/interfaces/project.interface';
import { Task } from '../../../../core/interfaces/task.interface';
import { Milestone } from '../../../../core/interfaces/milestone.interface';
import { Comment } from '../../../../core/interfaces/comment.interface';
import { ActivityEvent } from '../../../../core/interfaces/event.interface';
import { PaginationMeta } from '../../../../core/interfaces/pagination-meta.interface';
import { ApiService } from '../../../../core/services/api.service';
import { TaskStatus, TASK_STATUS_OPTIONS } from '../../../../core/enums/task-status.enum';
import { TaskPriority, TASK_PRIORITY_OPTIONS } from '../../../../core/enums/task-priority.enum';
import { SelectOption } from '../../../../shared/components/generic-select/generic-select.component';
import { BadgeOption } from '../../../../shared/components/generic-badge-select/generic-badge-select.component';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { GenericBadgeComponent } from '../../../../shared/components/generic-badge/generic-badge.component';
import { GenericSelectComponent } from '../../../../shared/components/generic-select/generic-select.component';
import { GenericBadgeSelectComponent } from '../../../../shared/components/generic-badge-select/generic-badge-select.component';
import { GenericSearchComponent } from '../../../../shared/components/generic-search/generic-search.component';
import { GenericSwitchComponent } from '../../../../shared/components/generic-switch/generic-switch.component';
import { ProjectService } from '../../services/project';
import { TaskService } from '../../services/task';
import { MilestoneService } from '../../services/milestone';
import { CommentService } from '../../services/comment';
import { GenericProgressBarComponent } from '../../../../shared/components/generic-progress-bar/generic-progress-bar.component';
import { GenericLoadingComponent } from '../../../../shared/components/generic-loading/generic-loading.component';

interface TaskForm {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  milestoneId: string;
  startDate: string;
  targetDate: string;
  endDate: string;
  deliveredDate: string;
}

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, GenericButtonComponent, GenericDialogComponent, GenericBadgeComponent, GenericSelectComponent, GenericBadgeSelectComponent, GenericSearchComponent, GenericSwitchComponent, GenericProgressBarComponent, GenericLoadingComponent],
  templateUrl: './project-detail.component.html',
})
export class ProjectDetailComponent implements OnInit {
  private api = inject(ApiService);
  private projectsApi = inject(ProjectService);
  private tasksApi = inject(TaskService);
  private milestonesApi = inject(MilestoneService);
  private commentsApi = inject(CommentService);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  private filter = inject(FilterService);
  authService = inject(AuthService);

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  milestones = signal<Milestone[]>([]);
  comments = signal<Comment[]>([]);
  history = signal<ActivityEvent[]>([]);
  historyPagination = signal<PaginationMeta | null>(null);
  historyLoading = signal(false);
  historyError = signal('');
  selectedTask = signal<Task | null>(null);
  projectId = '';

  columns = [
    { status: TaskStatus.TODO, label: 'To Do', dotColor: 'bg-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/30', border: 'border-gray-200 dark:border-gray-700' },
    { status: TaskStatus.IN_PROGRESS, label: 'In Progress', dotColor: 'bg-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800' },
    { status: TaskStatus.IN_REVIEW, label: 'In Review', dotColor: 'bg-amber-500', bg: 'bg-amber-50/50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800' },
    { status: TaskStatus.DONE, label: 'Done', dotColor: 'bg-emerald-500', bg: 'bg-emerald-50/50 dark:bg-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-800' },
  ];

  statusBadgeOptions: BadgeOption[] = TASK_STATUS_OPTIONS.map((o) => ({
    value: o.value, label: o.label,
    selectedClass: `${o.badge} border-2 border-current`,
    unselectedClass: `bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200`,
  }));

  priorityBadgeOptions: BadgeOption[] = TASK_PRIORITY_OPTIONS.map((o) => ({
    value: o.value, label: o.label,
    selectedClass: `${o.badge} border-2 border-current`,
    unselectedClass: `bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200`,
  }));

  milestoneSelectOptions: SelectOption[] = [];

  showTaskDialog = signal(false);
  showMilestoneDialog = signal(false);
  showCommentsPanel = signal(false);
  editingTask = signal<Task | null>(null);
  editingMilestone = signal<Milestone | null>(null);
  draggedTask = signal<Task | null>(null);
  taskSearch = '';
  filterStatus = signal<string>('');
  filterPriority = signal<string>('');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');
  sortBy = signal<string>('newest');
  showDeleted = signal(false);
  newComment = '';

  taskForm: TaskForm = { title: '', description: '', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, milestoneId: '', startDate: '', targetDate: '', endDate: '', deliveredDate: '' };
  milestoneForm = { name: '' };

  totalTasks = computed(() => this.tasks().length);
  completedTasks = computed(() => this.tasks().filter(t => t.status === TaskStatus.DONE).length);
  progressPercent = computed(() => this.totalTasks() === 0 ? 0 : Math.round((this.completedTasks() / this.totalTasks()) * 100));

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('projectSlug') || '';
    this.loadProject(slug);
  }

  loadProject(slug: string): void {
    this.projectsApi.getBySlug(slug).subscribe({
      next: (res) => {
        this.project.set(res.data);
        this.projectId = res.data._id;
        this.loadTasks();
        this.loadMilestones();
        this.loadHistory();
      },
    });
  }

  loadTasks(): void {
    this.api.getAllPages<Task>(`tasks/project/${this.projectId}`, this.showDeleted()).subscribe({ next: (tasks) => this.tasks.set(tasks) });
  }

  onToggleDeleted(show: boolean): void {
    this.showDeleted.set(show);
    this.loadTasks();
  }

  loadMilestones(): void {
    this.api.getAllPages<Milestone>(`milestones/project/${this.projectId}`).subscribe({
      next: (milestones) => {
        this.milestones.set(milestones);
        this.milestoneSelectOptions = milestones.map((m) => ({ value: m._id, label: m.name }));
      },
    });
  }

  loadComments(taskId: string): void {
    this.api.getAllPages<Comment>(`comments/task/${taskId}`).subscribe({ next: (comments) => this.comments.set(comments) });
  }

  loadHistory(reset = true): void {
    if (!this.projectId || this.historyLoading()) return;
    const page = reset ? 1 : (this.historyPagination()?.page ?? 0) + 1;
    if (!reset && page > (this.historyPagination()?.totalPages ?? 0)) return;
    this.historyLoading.set(true);
    this.historyError.set('');
    this.api.getAll<ActivityEvent>(`events/project/${this.projectId}`, { page, limit: 10 }).subscribe({
      next: (response) => {
        this.history.set(reset ? response.data : [...this.history(), ...response.data]);
        this.historyPagination.set(response.pagination);
        this.historyLoading.set(false);
      },
      error: () => {
        this.historyError.set('Could not load activity history.');
        this.historyLoading.set(false);
      },
    });
  }

  getUserName(user?: string | Record<string, unknown>): string {
    if (!user) return 'Unknown';
    if (typeof user === 'string') return 'Unknown';
    return (user['userName'] as string) || 'Unknown';
  }

  canManageMilestones(): boolean {
    const current = this.authService.currentUser();
    if (!current) return false;
    return current.role === 'Admin' || (current.role === 'Leader' && this.recordUserId(this.project()?.createdBy) === current._id);
  }

  canDeleteComment(comment: Comment): boolean {
    const current = this.authService.currentUser();
    return !!current && (current.role === 'Admin' || this.recordUserId(comment.createdBy) === current._id);
  }

  private recordUserId(user?: string | Record<string, unknown>): string | undefined {
    return typeof user === 'string' ? user : user?.['_id'] as string | undefined;
  }

  getMilestoneTaskCount(milestoneId: string): number {
    return this.tasks().filter(t => t.milestoneId === milestoneId).length;
  }

  getMilestoneCompletedCount(milestoneId: string): number {
    return this.tasks().filter(t => t.milestoneId === milestoneId && t.status === TaskStatus.DONE).length;
  }

  getMilestoneProgress(milestoneId: string): number {
    const total = this.getMilestoneTaskCount(milestoneId);
    return total === 0 ? 0 : Math.round(this.getMilestoneCompletedCount(milestoneId) / total * 100);
  }

  isOverdue(task: Task): boolean {
    if (!task.targetDate || task.status === TaskStatus.DONE) return false;
    return new Date(task.targetDate) < new Date();
  }

  getDaysUntilTarget(task: Task): number | null {
    if (!task.targetDate) return null;
    const diff = new Date(task.targetDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getOverdueDays(task: Task): number {
    const days = this.getDaysUntilTarget(task);
    return days !== null ? Math.abs(days) : 0;
  }

  getByStatus(status: TaskStatus): Task[] {
    let tasks = this.tasks();
    if (this.taskSearch) {
      const q = this.taskSearch.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
    }
    if (this.filterStatus()) {
      tasks = tasks.filter((t) => t.status === this.filterStatus());
    }
    if (this.filterPriority()) {
      tasks = tasks.filter((t) => t.priority === this.filterPriority());
    }
    if (this.filterDateFrom()) {
      const from = new Date(this.filterDateFrom());
      tasks = tasks.filter((t) => t.targetDate && new Date(t.targetDate) >= from);
    }
    if (this.filterDateTo()) {
      const to = new Date(this.filterDateTo());
      tasks = tasks.filter((t) => t.targetDate && new Date(t.targetDate) <= to);
    }
    const filtered = tasks.filter((t) => t.status === status);
    return this.sortTasks(filtered);
  }

  sortTasks(tasks: Task[]): Task[] {
    const sort = this.sortBy();
    return [...tasks].sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'target-asc') {
        if (!a.targetDate) return 1;
        if (!b.targetDate) return -1;
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      }
      if (sort === 'target-desc') {
        if (!a.targetDate) return 1;
        if (!b.targetDate) return -1;
        return new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime();
      }
      if (sort === 'priority') {
        const order: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
      }
      return 0;
    });
  }

  onFilterStatus(value: string): void { this.filterStatus.set(value); }
  onFilterPriority(value: string): void { this.filterPriority.set(value); }
  onFilterDateFrom(value: string): void { this.filterDateFrom.set(value); }
  onFilterDateTo(value: string): void { this.filterDateTo.set(value); }
  onSortBy(value: string): void { this.sortBy.set(value); }

  clearFilters(): void {
    this.taskSearch = '';
    this.filterStatus.set('');
    this.filterPriority.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.sortBy.set('newest');
    this.showDeleted.set(false);
  }

  hasActiveFilters(): boolean {
    return !!(this.taskSearch || this.filterStatus() || this.filterPriority() || this.filterDateFrom() || this.filterDateTo() || this.sortBy() !== 'newest' || this.showDeleted());
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

  onSearchTasks(query: string): void { this.taskSearch = query; }

  onDragStart(event: DragEvent, task: Task): void {
    this.draggedTask.set(task);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  onDragLeave(_event: DragEvent): void {}

  onDragEnd(): void { this.draggedTask.set(null); }

  onDrop(event: DragEvent, newStatus: TaskStatus): void {
    event.preventDefault();
    const task = this.draggedTask();
    if (task && task.status !== newStatus) {
      this.tasksApi.move(task._id, { status: newStatus }).subscribe({
        next: () => {
          this.tasks.update((ts) => ts.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t)));
          this.loadHistory();
        },
      });
    }
    this.draggedTask.set(null);
  }

  onStatusChange(value: string): void { this.taskForm.status = value as TaskStatus; }
  onPriorityChange(value: string): void { this.taskForm.priority = value as TaskPriority; }

  openCreateTask(): void {
    this.editingTask.set(null);
    this.taskForm = { title: '', description: '', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, milestoneId: '', startDate: '', targetDate: '', endDate: '', deliveredDate: '' };
    this.showTaskDialog.set(true);
  }

  openEditTask(task: Task): void {
    this.editingTask.set(task);
    this.taskForm = {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      milestoneId: task.milestoneId || '',
      startDate: task.startDate ? task.startDate.split('T')[0] : '',
      targetDate: task.targetDate ? task.targetDate.split('T')[0] : '',
      endDate: task.endDate ? task.endDate.split('T')[0] : '',
      deliveredDate: task.deliveredDate ? task.deliveredDate.split('T')[0] : '',
    };
    this.showTaskDialog.set(true);
  }

  closeTaskDialog(): void { this.showTaskDialog.set(false); this.editingTask.set(null); }

  saveTask(): void {
    const data = {
      ...this.taskForm,
      projectId: this.projectId,
      milestoneId: this.taskForm.milestoneId || undefined,
      startDate: this.taskForm.startDate || null,
      targetDate: this.taskForm.targetDate || null,
      endDate: this.taskForm.endDate || null,
      deliveredDate: this.taskForm.deliveredDate || null,
    };
    const obs = this.editingTask()
      ? this.tasksApi.update(this.editingTask()!._id, data)
      : this.tasksApi.create(data);
    obs.subscribe({ next: () => { this.loadTasks(); this.loadHistory(); this.closeTaskDialog(); } });
  }

  confirmDeleteTask(task: Task): void {
    this.alert.confirm(`Delete "${task.title}"?`, () => {
      this.tasksApi.delete(task._id).subscribe({ next: () => { this.loadTasks(); this.loadHistory(); } });
    }, 'Delete Task');
  }

  openComments(task: Task): void {
    this.selectedTask.set(task);
    this.loadComments(task._id);
    this.showCommentsPanel.set(true);
  }

  closeComments(): void {
    this.showCommentsPanel.set(false);
    this.selectedTask.set(null);
    this.newComment = '';
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.selectedTask()) return;
    this.commentsApi.create({ content: this.newComment, taskId: this.selectedTask()!._id }).subscribe({
      next: () => { this.loadComments(this.selectedTask()!._id); this.loadHistory(); this.newComment = ''; },
    });
  }

  deleteComment(comment: Comment): void {
    this.commentsApi.delete(comment._id).subscribe({
      next: () => { this.loadComments(this.selectedTask()!._id); this.loadHistory(); },
    });
  }

  openEditMilestone(m: Milestone): void {
    this.editingMilestone.set(m);
    this.milestoneForm = { name: m.name };
    this.showMilestoneDialog.set(true);
  }

  closeMilestoneDialog(): void { this.showMilestoneDialog.set(false); this.editingMilestone.set(null); }

  saveMilestone(): void {
    const data = { ...this.milestoneForm, projectId: this.projectId };
    const obs = this.editingMilestone()
      ? this.milestonesApi.update(this.editingMilestone()!._id, data)
      : this.milestonesApi.create(data);
    obs.subscribe({ next: () => { this.loadMilestones(); this.loadHistory(); this.closeMilestoneDialog(); } });
  }

  confirmDeleteMilestone(m: Milestone): void {
    this.alert.confirm(`Delete "${m.name}"?`, () => {
      this.milestonesApi.delete(m._id).subscribe({ next: () => { this.loadMilestones(); this.loadHistory(); } });
    }, 'Delete Milestone');
  }
}
