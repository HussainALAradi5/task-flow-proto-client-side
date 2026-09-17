import { BaseEntity } from './base.model';

export interface User extends BaseEntity {
  userName: string;
  email: string;
  mobileNumber?: string;
  teamId?: string;
  role: 'Admin' | 'Leader' | 'Member';
}
