export interface CreateEventRequest {
  title: string;
  description?: string;
  entityType: string;
  entityId: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
}
