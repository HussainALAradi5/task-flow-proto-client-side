import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/interfaces/api-response.interface';
import { PaginatedResult } from '../../../core/interfaces/paginated-result.interface';
import { Task as TaskEntity } from '../../../core/interfaces/task.interface';
import { CreateTaskRequest, UpdateTaskRequest } from '../../../core/dto/task.dto';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly api = inject(ApiService);

  getByProject(projectId: string, includeInactive = false): Observable<PaginatedResult<TaskEntity>> {
    return this.api.getAll<TaskEntity>(`tasks/project/${projectId}`, undefined, undefined, false, includeInactive);
  }

  create(data: CreateTaskRequest): Observable<ApiResponse<TaskEntity>> {
    return this.api.create<TaskEntity>('tasks', data, 'Task created');
  }

  update(id: string, data: UpdateTaskRequest): Observable<ApiResponse<TaskEntity>> {
    return this.api.update<TaskEntity>('tasks', id, data, 'Task updated');
  }

  move(id: string, data: UpdateTaskRequest): Observable<ApiResponse<TaskEntity>> {
    return this.api.update<TaskEntity>('tasks', id, data, 'Task moved');
  }

  delete(id: string): Observable<ApiResponse<TaskEntity>> {
    return this.api.delete<TaskEntity>('tasks', id, 'Task deleted');
  }
}
