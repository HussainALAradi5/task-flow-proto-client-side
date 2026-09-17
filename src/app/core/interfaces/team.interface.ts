import { BaseEntity } from './base-entity.interface';

export interface Team extends BaseEntity {
  name: string;
  description?: string;
}
