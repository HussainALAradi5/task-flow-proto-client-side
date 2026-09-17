import { User } from './user.interface';

export interface AuthResponse {
  status: 'success';
  token: string;
  data: User;
}
