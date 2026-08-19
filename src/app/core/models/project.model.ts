export interface Project {
  _id: string;
  title: string;
  description?: string;
  teamId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  teamId?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  teamId?: string;
}
