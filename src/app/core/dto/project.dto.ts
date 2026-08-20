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
