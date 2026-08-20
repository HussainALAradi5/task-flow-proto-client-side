import { BaseEntity } from './base.model';

export interface Project extends BaseEntity {
  title: string;
  description?: string;
  teamId?: string;
}
