import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/interfaces/api-response.interface';
import { PaginatedResult } from '../../../core/interfaces/paginated-result.interface';
import { Team as TeamEntity } from '../../../core/interfaces/team.interface';
import { CreateTeamRequest, UpdateTeamRequest } from '../../../core/dto/team.dto';

export interface TeamInvitation {
  _id: string;
  teamId: { _id: string; name: string };
  invitedBy: { _id: string; userName: string };
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private readonly api = inject(ApiService);
  readonly pendingCount = signal(0);

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

  addMember(id: string, email: string): Observable<ApiResponse<unknown>> {
    return this.api.create<unknown>(`teams/${id}/members`, { email }, 'Invitation sent');
  }

  pendingInvitations(): Observable<ApiResponse<TeamInvitation[]>> {
    return this.api.getById<TeamInvitation[]>('teams/invitations', 'pending').pipe(tap((res) => this.pendingCount.set(res.data.length)));
  }

  respondToInvitation(id: string, decision: 'accept' | 'decline'): Observable<ApiResponse<unknown>> {
    return this.api.create<unknown>(`teams/invitations/${id}/respond`, { decision }, decision === 'accept' ? 'Invitation accepted' : 'Invitation declined');
  }

  removeMember(id: string, userId: string): Observable<ApiResponse<TeamEntity>> {
    return this.api.delete<TeamEntity>(`teams/${id}/members`, userId, 'Member removed');
  }
}
