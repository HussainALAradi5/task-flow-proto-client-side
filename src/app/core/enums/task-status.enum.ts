export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  IN_REVIEW = 'In Review',
  DONE = 'Done',
}

export const TASK_STATUS_OPTIONS = [
  { value: TaskStatus.TODO, label: 'To Do', color: 'bg-gray-400', badge: 'bg-gray-100 text-gray-700' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
  { value: TaskStatus.IN_REVIEW, label: 'In Review', color: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
  { value: TaskStatus.DONE, label: 'Done', color: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
];
