export interface BaseEntity {
  _id: string;
  code: string;
  slug: string;
  createdBy?: string | Record<string, unknown>;
  updatedBy?: string | Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}
