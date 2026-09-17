import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId: string;
  milestoneId?: string;
  assignTo?: string;
  startDate?: string | null;
  targetDate?: string | null;
  endDate?: string | null;
  deliveredDate?: string | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  milestoneId?: string;
  assignTo?: string;
  startDate?: string | null;
  targetDate?: string | null;
  endDate?: string | null;
  deliveredDate?: string | null;
}
