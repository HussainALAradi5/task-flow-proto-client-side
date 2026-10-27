import { BaseEntity } from './base-entity.interface';

export interface Project extends BaseEntity {
  title: string;
  description?: string;
  teamId?: string | { _id: string; name: string };
  members?: Array<string | { _id: string; userName: string; email: string }>;
}
