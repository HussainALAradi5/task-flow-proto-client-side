export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export const TASK_PRIORITY_OPTIONS = [
  { value: TaskPriority.LOW, label: 'Low', color: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700' },
  { value: TaskPriority.MEDIUM, label: 'Medium', color: 'bg-green-400', badge: 'bg-green-100 text-green-700' },
  { value: TaskPriority.HIGH, label: 'High', color: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
  { value: TaskPriority.CRITICAL, label: 'Critical', color: 'bg-red-400', badge: 'bg-red-100 text-red-700' },
];
