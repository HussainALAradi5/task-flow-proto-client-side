import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/interfaces/api-response.interface';
import { PaginatedResult } from '../../../core/interfaces/paginated-result.interface';
import { Milestone as MilestoneEntity } from '../../../core/interfaces/milestone.interface';
import { CreateMilestoneRequest, UpdateMilestoneRequest } from '../../../core/dto/milestone.dto';

@Injectable({
  providedIn: 'root',
})
export class MilestoneService {
  private readonly api = inject(ApiService);

  getByProject(projectId: string): Observable<PaginatedResult<MilestoneEntity>> {
    return this.api.getAll<MilestoneEntity>(`milestones/project/${projectId}`);
  }

  create(data: CreateMilestoneRequest): Observable<ApiResponse<MilestoneEntity>> {
    return this.api.create<MilestoneEntity>('milestones', data, 'Milestone created');
  }

  update(id: string, data: UpdateMilestoneRequest): Observable<ApiResponse<MilestoneEntity>> {
    return this.api.update<MilestoneEntity>('milestones', id, data, 'Milestone updated');
  }

  delete(id: string): Observable<ApiResponse<MilestoneEntity>> {
    return this.api.delete<MilestoneEntity>('milestones', id, 'Milestone deleted');
  }
}
