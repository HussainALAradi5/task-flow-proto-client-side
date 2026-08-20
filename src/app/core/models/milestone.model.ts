import { BaseEntity } from './base.model';

export interface Milestone extends BaseEntity {
  name: string;
  projectId: string;
}
