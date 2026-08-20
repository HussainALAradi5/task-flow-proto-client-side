import { BaseEntity } from './base.interface';

export interface Comment extends BaseEntity {
  content: string;
  taskId: string;
  createdBy?: string | Record<string, unknown>;
}
