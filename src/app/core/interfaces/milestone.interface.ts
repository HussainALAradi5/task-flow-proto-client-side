import { BaseEntity } from './base-entity.interface';

export interface Milestone extends BaseEntity {
  name: string;
  projectId: string;
}
