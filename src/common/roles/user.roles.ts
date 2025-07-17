import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './../decorator/roles';

@Injectable()
export class UserRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const decoded = request.decoded;
    if(!decoded || decoded == undefined) return false;
    return this.matchRoles(roles, decoded.userRole);
  }

  matchRoles(roles, userRole) {
    return roles.indexOf(userRole) >= 0 ? true : false;
  }
}
