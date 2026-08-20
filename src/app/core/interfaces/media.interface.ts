import { BaseEntity } from './base.interface';
import { EntityModelType } from '../enums/entity-model-type.enum';

export interface Media extends BaseEntity {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  entityType: EntityModelType;
  entityId: string;
}
