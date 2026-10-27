import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/interfaces/api-response.interface';
import { PaginatedResult } from '../../../core/interfaces/paginated-result.interface';
import { PaginationParams } from '../../../core/interfaces/pagination-params.interface';
import { Project as ProjectEntity } from '../../../core/interfaces/project.interface';
import { CreateProjectRequest, UpdateProjectRequest } from '../../../core/dto/project.dto';
import { ProjectScope } from '../../../core/enums/project-scope.enum';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly api = inject(ApiService);

  getAll(params: PaginationParams, search?: string, exactMatch = false, includeInactive = false, scope: ProjectScope = ProjectScope.All, teamId?: string): Observable<PaginatedResult<ProjectEntity>> {
    return this.api.getAll<ProjectEntity>('projects', params, search, exactMatch, includeInactive, { scope, ...(teamId ? { teamId } : {}) });
  }

  getByTeam(teamId: string): Observable<ProjectEntity[]> {
    return this.api.getAllPages<ProjectEntity>('projects', false, { teamId });
  }

  getAllTeamProjects(): Observable<ProjectEntity[]> {
    return this.api.getAllPages<ProjectEntity>('projects', false, { scope: ProjectScope.Team });
  }

  getBySlug(slug: string): Observable<ApiResponse<ProjectEntity>> {
    return this.api.getById<ProjectEntity>('projects/slug', slug);
  }

  create(data: CreateProjectRequest): Observable<ApiResponse<ProjectEntity>> {
    return this.api.create<ProjectEntity>('projects', data, 'Project created');
  }

  update(id: string, data: UpdateProjectRequest): Observable<ApiResponse<ProjectEntity>> {
    return this.api.update<ProjectEntity>('projects', id, data, 'Project updated');
  }

  delete(id: string): Observable<ApiResponse<ProjectEntity>> {
    return this.api.delete<ProjectEntity>('projects', id, 'Project deleted');
  }
}
