import { BaseEntity } from './base.model';

export interface User extends BaseEntity {
  userName: string;
  email: string;
  mobileNumber?: string;
  teamId?: string;
  role: 'Admin' | 'Leader' | 'Member';
}

export enum UserRole {
  ADMIN = 'Admin',
  LEADER = 'Leader',
  MEMBER = 'Member',
}

export interface AuthResponse {
  status: string;
  token: string;
  data: User;
}
