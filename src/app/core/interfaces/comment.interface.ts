import { BaseEntity } from './base-entity.interface';

export interface Comment extends BaseEntity {
  content: string;
  attachment?: string;
  taskId: string;
  createdBy?: string | Record<string, unknown>;
}
