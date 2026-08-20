import { BaseEntity } from './base.interface';

export interface Team extends BaseEntity {
  name: string;
  description?: string;
}
