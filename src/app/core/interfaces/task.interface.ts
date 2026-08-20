import { BaseEntity } from './base.interface';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  milestoneId?: string;
  assignTo?: string;
  lastAssignTo?: string;
  startDate?: string;
  targetDate?: string;
  endDate?: string;
  lastReviewedBy?: string;
  lastReviewedAt?: string;
}
