import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/interfaces/api-response.interface';
import { PaginatedResult } from '../../../core/interfaces/paginated-result.interface';
import { Comment as CommentEntity } from '../../../core/interfaces/comment.interface';
import { CreateCommentRequest, UpdateCommentRequest } from '../../../core/dto/comment.dto';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly api = inject(ApiService);

  getByTask(taskId: string): Observable<PaginatedResult<CommentEntity>> {
    return this.api.getAll<CommentEntity>(`comments/task/${taskId}`);
  }

  create(data: CreateCommentRequest): Observable<ApiResponse<CommentEntity>> {
    return this.api.create<CommentEntity>('comments', data, 'Comment added');
  }

  update(id: string, data: UpdateCommentRequest): Observable<ApiResponse<CommentEntity>> {
    return this.api.update<CommentEntity>('comments', id, data, 'Comment updated');
  }

  delete(id: string): Observable<ApiResponse<CommentEntity>> {
    return this.api.delete<CommentEntity>('comments', id, 'Comment deleted');
  }
}
