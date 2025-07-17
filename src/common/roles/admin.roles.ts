import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const decoded = request.decoded;
    if(!decoded || decoded == undefined) return false;
    if (!decoded.hasOwnProperty('adminRole')) return false;
    return this.matchRoles(roles, decoded.adminRole);
  }

  matchRoles(roles, adminRole) {
    return roles.indexOf(adminRole) >= 0 ? true : false;
  }
}
