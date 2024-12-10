import { PermissionType } from '../permission.type';
import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../../iam.constants';

export const Permissions = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
