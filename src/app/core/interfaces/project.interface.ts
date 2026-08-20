import { BaseEntity } from './base.interface';

export interface Project extends BaseEntity {
  title: string;
  description?: string;
  teamId?: string;
}
