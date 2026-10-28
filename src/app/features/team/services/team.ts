import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/interfaces/api-response.interface';
import { PaginatedResult } from '../../../core/interfaces/paginated-result.interface';
import { Team as TeamEntity } from '../../../core/interfaces/team.interface';
import { CreateTeamRequest, UpdateTeamRequest } from '../../../core/dto/team.dto';
import { TeamInvitation } from '../../../core/interfaces/team-invitation.interface';
import { TeamMessage } from '../../../core/interfaces/team-message.interface';
import { SendTeamMessageRequest } from '../../../core/dto/team-message.dto';
import { InvitationDecision } from '../../../core/enums/invitation-decision.enum';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private readonly api = inject(ApiService);
  readonly pendingCount = signal(0);

  getAll(page: number, limit = 9): Observable<PaginatedResult<TeamEntity>> {
    return this.api.getAll<TeamEntity>('teams', { page, limit });
  }

  getAllTeams(): Observable<TeamEntity[]> { return this.api.getAllPages<TeamEntity>('teams'); }

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

  respondToInvitation(id: string, decision: InvitationDecision): Observable<ApiResponse<unknown>> {
    return this.api.create<unknown>(`teams/invitations/${id}/respond`, { decision }, decision === InvitationDecision.Accept ? 'Invitation accepted' : 'Invitation declined');
  }

  removeMember(id: string, userId: string): Observable<ApiResponse<TeamEntity>> {
    return this.api.delete<TeamEntity>(`teams/${id}/members`, userId, 'Member removed');
  }

  getMessages(teamId: string, page: number): Observable<PaginatedResult<TeamMessage>> {
    return this.api.getAll<TeamMessage>(`teams/${teamId}/messages`, { page, limit: 50 });
  }

  sendMessage(teamId: string, body: SendTeamMessageRequest): Observable<ApiResponse<TeamMessage>> {
    return this.api.create<TeamMessage>(`teams/${teamId}/messages`, body);
  }
}
