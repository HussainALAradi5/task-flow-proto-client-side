import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/interfaces/api-response.interface';
import { PaginatedResult } from '../../../core/interfaces/paginated-result.interface';
import { Team as TeamEntity } from '../../../core/interfaces/team.interface';
import { CreateTeamRequest, UpdateTeamRequest } from '../../../core/dto/team.dto';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private readonly api = inject(ApiService);

  getAll(page: number, limit = 9): Observable<PaginatedResult<TeamEntity>> {
    return this.api.getAll<TeamEntity>('teams', { page, limit });
  }

  create(data: CreateTeamRequest): Observable<ApiResponse<TeamEntity>> {
    return this.api.create<TeamEntity>('teams', data, 'Team created');
  }

  update(id: string, data: UpdateTeamRequest): Observable<ApiResponse<TeamEntity>> {
    return this.api.update<TeamEntity>('teams', id, data, 'Team updated');
  }

  delete(id: string): Observable<ApiResponse<TeamEntity>> {
    return this.api.delete<TeamEntity>('teams', id, 'Team deleted');
  }
}
