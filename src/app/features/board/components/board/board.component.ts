import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FilterService } from '../../../../core/services/filter.service';
import { AlertService } from '../../../../core/services/alert.service';
import { ProjectService } from '../../services/project';
import { AuthService } from '../../../../core/services/auth.service';
import { Project } from '../../../../core/interfaces/project.interface';
import { PaginationMeta } from '../../../../core/interfaces/pagination-meta.interface';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { GenericPaginationComponent } from '../../../../shared/components/generic-pagination/generic-pagination.component';
import { GenericSearchComponent } from '../../../../shared/components/generic-search/generic-search.component';
import { GenericSwitchComponent } from '../../../../shared/components/generic-switch/generic-switch.component';
import { GenericLoadingComponent } from '../../../../shared/components/generic-loading/generic-loading.component';
import { TeamService } from '../../../team/services/team';
import { Team } from '../../../../core/interfaces/team.interface';
import { ProjectScope } from '../../../../core/enums/project-scope.enum';
import { ViewMode } from '../../../../core/enums/view-mode.enum';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, GenericButtonComponent, GenericDialogComponent, GenericPaginationComponent, GenericSearchComponent, GenericSwitchComponent, GenericLoadingComponent],
  templateUrl: './board.component.html',
})
export class BoardComponent implements OnInit {
  readonly ProjectScope = ProjectScope;
  readonly ViewMode = ViewMode;
  private projectsApi = inject(ProjectService);
  private alert = inject(AlertService);
  private filter = inject(FilterService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private teamsApi = inject(TeamService);
  auth = inject(AuthService);

  projects = signal<Project[]>([]);
  teams = signal<Team[]>([]);
  scope = signal<ProjectScope>(ProjectScope.All);
  teamFilter = signal('');
  viewMode = signal<ViewMode>(ViewMode.Grid);
  pagination = signal<PaginationMeta | null>(null);
  loading = signal(true);
  showDialog = signal(false);
  editingProject = signal<Project | null>(null);
  exactMatch = signal(false);
  showDeleted = signal(false);
  formData = { title: '', description: '', teamId: '' };

  ngOnInit(): void {
    this.viewMode.set(localStorage.getItem('taskflow-project-view') === ViewMode.List ? ViewMode.List : ViewMode.Grid);
    this.teamsApi.getAllTeams().subscribe({ next: (teams) => this.teams.set(teams) });
    this.route.queryParamMap.subscribe((params) => {
      this.teamFilter.set(params.get('teamId') || '');
      if (this.teamFilter()) this.scope.set(ProjectScope.Team);
      this.filter.setPage(1);
      this.loadProjects();
    });
  }

  loadProjects(): void {
    this.loading.set(true);
    const { search, exactMatch, page, limit } = this.filter.getParams();
    this.projectsApi.getAll({ page, limit }, search || undefined, exactMatch, this.showDeleted(), this.scope(), this.teamFilter() || undefined).subscribe({
      next: (res) => {
        this.projects.set(res.data);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(query: string): void {
    this.filter.setSearch(query);
    this.loadProjects();
  }

  onExactMatchChange(exactMatch: boolean): void {
    this.exactMatch.set(exactMatch);
    this.filter.setExactMatch(exactMatch);
    this.loadProjects();
  }

  onToggleDeleted(show: boolean): void {
    this.showDeleted.set(show);
    this.loadProjects();
  }

  onPageChange(page: number): void {
    this.filter.setPage(page);
    this.loadProjects();
  }

  setScope(value: ProjectScope): void {
    this.scope.set(value);
    this.teamFilter.set('');
    this.filter.setPage(1);
    if (this.route.snapshot.queryParamMap.has('teamId')) this.router.navigate([], { relativeTo: this.route, queryParams: { teamId: null }, queryParamsHandling: 'merge' });
    else this.loadProjects();
  }
  setViewMode(value: ViewMode): void { this.viewMode.set(value); localStorage.setItem('taskflow-project-view', value); }
  teamName(project: Project): string { return typeof project.teamId === 'object' ? project.teamId.name : this.teams().find((team) => team._id === project.teamId)?.name || 'Team'; }
  selectedTeamName(): string { return this.teams().find((team) => team._id === this.teamFilter())?.name || 'selected team'; }
  isTeamProject(project: Project): boolean { return !!project.teamId; }
  canEditProject(project: Project): boolean {
    const ownerId = typeof project.createdBy === 'string' ? project.createdBy : project.createdBy?.['_id'];
    return this.auth.isAdmin() || (!!ownerId && ownerId === this.auth.currentUser()?._id);
  }

  openCreateDialog(): void {
    this.editingProject.set(null);
    this.formData = { title: '', description: '', teamId: '' };
    this.showDialog.set(true);
  }

  openEditDialog(project: Project): void {
    this.editingProject.set(project);
    this.formData = { title: project.title, description: project.description || '', teamId: typeof project.teamId === 'object' ? project.teamId._id : project.teamId || '' };
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.editingProject.set(null);
  }

  saveProject(): void {
    const creating = !this.editingProject();
    const data = { ...this.formData, teamId: this.formData.teamId || null };
    const obs = this.editingProject()
      ? this.projectsApi.update(this.editingProject()!._id, data)
      : this.projectsApi.create({ ...data, teamId: data.teamId || undefined });
    obs.subscribe({ next: () => {
      if (creating) this.auth.getProfile().subscribe();
      this.loadProjects();
      this.closeDialog();
    } });
  }

  confirmDelete(project: Project): void {
    this.alert.confirm(`Delete "${project.title}"?`, () => {
      this.projectsApi.delete(project._id).subscribe({ next: () => this.loadProjects() });
    }, 'Delete Project');
  }
}
