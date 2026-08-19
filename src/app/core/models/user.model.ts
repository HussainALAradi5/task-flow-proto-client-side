export interface User {
  _id: string;
  userName: string;
  email: string;
  mobileNumber?: string;
  teamId?: string;
  role: 'Admin' | 'Leader' | 'Member';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'Admin',
  LEADER = 'Leader',
  MEMBER = 'Member',
}

export interface SignupRequest {
  userName: string;
  email: string;
  password: string;
  mobileNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: User;
}
