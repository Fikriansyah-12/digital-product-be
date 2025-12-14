import { CustomDecorator, SetMetadata } from '@nestjs/common';

export type Roles = 'ADMIN' | 'USER' | 'CREATOR';
export const ROLES_KEY = 'roles';
export const Roles :(...roles: Roles[]) => CustomDecorator<string> = (...roles: Roles[]): CustomDecorator<string> => SetMetadata(ROLES_KEY, roles);
