import { BaseEntity } from './base-entity.interface';

export interface Team extends BaseEntity {
  name: string;
  description?: string;
  members?: Array<string | { _id: string; userName: string; email: string }>;
}
