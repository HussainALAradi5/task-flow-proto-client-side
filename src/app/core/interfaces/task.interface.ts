import { BaseEntity } from './base.interface';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';

export interface PopulatedUser extends Record<string, unknown> {
  _id: string;
  userName: string;
  email: string;
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  milestoneId?: string;
  assignTo?: string | PopulatedUser;
  lastAssignTo?: string | PopulatedUser;
  startDate?: string;
  targetDate?: string;
  endDate?: string;
  deliveredDate?: string;
  lastReviewedBy?: string | PopulatedUser;
  lastReviewedAt?: string;
}
