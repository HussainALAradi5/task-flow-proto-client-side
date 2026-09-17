import { BaseEntity } from './base-entity.interface';
import { UserRole } from '../enums/user-role.enum';

export interface User extends BaseEntity {
  userName: string;
  email: string;
  mobileNumber?: string;
  teamId?: string;
  role: UserRole;
}
