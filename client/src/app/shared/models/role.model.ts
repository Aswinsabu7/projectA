export interface Permission {
  _id: string;
  key: string;
  name: string;
  group: string;
  description: string;
  isActive: boolean;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[] | string[];
  isSystemRole: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
