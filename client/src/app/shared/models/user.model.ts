import { Role } from './role.model';

export type UserStatus = 'Active' | 'Inactive';

export interface AppUser {
  _id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  mobile: string;
  username: string;
  role: Role | string;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: string | null;
  roleId: string | null;
  permissions: string[];
}
