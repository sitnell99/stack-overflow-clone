import { PermissionType } from '../authorization/permission.type';

export interface ActiveUserData {
  sub: number;
  email: string;
  permissions: PermissionType;
}
