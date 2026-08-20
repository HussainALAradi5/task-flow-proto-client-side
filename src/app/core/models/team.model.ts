import { BaseEntity } from './base.model';

export interface Team extends BaseEntity {
  name: string;
  description?: string;
}
