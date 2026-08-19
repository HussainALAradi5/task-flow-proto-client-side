export interface Comment {
  _id: string;
  content: string;
  taskId: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  taskId: string;
}

export interface UpdateCommentRequest {
  content: string;
}
