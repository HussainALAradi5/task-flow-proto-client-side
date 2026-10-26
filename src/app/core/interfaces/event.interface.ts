export interface ActivityEvent {
  _id: string;
  title: string;
  description?: string;
  entityType: 'Project' | 'Task' | 'Milestone' | 'Team' | 'User';
  entityId: string;
  createdBy?: string | { _id: string; userName: string; email: string };
  createdAt: string;
}
