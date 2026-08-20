import { BaseEntity } from './base.model';

export interface Comment extends BaseEntity {
  content: string;
  taskId: string;
}
