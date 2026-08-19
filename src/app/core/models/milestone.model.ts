export interface Milestone {
  _id: string;
  name: string;
  projectId: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneRequest {
  name: string;
  projectId: string;
}

export interface UpdateMilestoneRequest {
  name?: string;
}
