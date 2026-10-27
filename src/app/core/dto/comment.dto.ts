export interface CreateCommentRequest {
  content: string;
  attachment?: string;
  taskId: string;
}

export interface UpdateCommentRequest {
  content: string;
}
