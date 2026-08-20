import { BaseEntity } from './base.model';

export interface Media extends BaseEntity {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  entityType: string;
  entityId: string;
}

export enum EntityModelType {
  USER = 'User',
  TEAM = 'Team',
  PROJECT = 'Project',
  TASK = 'Task',
  MILESTONE = 'Milestone',
  COMMENT = 'Comment',
}
