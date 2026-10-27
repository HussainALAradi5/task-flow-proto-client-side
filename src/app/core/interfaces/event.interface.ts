import { EntityType } from '../enums/entity-type.enum';

export interface ActivityEvent {
  _id: string;
  title: string;
  description?: string;
  entityType: EntityType;
  entityId: string;
  createdBy?: string | { _id: string; userName: string; email: string };
  createdAt: string;
}
