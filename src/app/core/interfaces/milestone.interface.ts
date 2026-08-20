import { BaseEntity } from './base.interface';

export interface Milestone extends BaseEntity {
  name: string;
  projectId: string;
}
