export interface SignupRequest {
  userName: string;
  email: string;
  password: string;
  mobileNumber?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface UpdateProfileRequest {
  userName?: string;
  email?: string;
  mobileNumber?: string;
}

export interface UpdateRoleRequest {
  role: 'Admin' | 'Leader' | 'Member';
}
