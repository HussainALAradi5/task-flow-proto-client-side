import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';

export interface TaskForm {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  milestoneId: string;
  startDate: string;
  targetDate: string;
  endDate: string;
  deliveredDate: string;
}
