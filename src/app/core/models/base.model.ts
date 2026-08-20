export interface BaseEntity {
  _id: string;
  code: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}
