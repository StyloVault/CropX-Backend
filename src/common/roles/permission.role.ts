import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';


@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions) {
      return true; // No specific permissions required
    }

    const { decoded } = context.switchToHttp().getRequest();
    //If user is owner return true
    if(['User', 'Company', 'Supervisor'].includes(decoded.userRole)){
      return true;
  }
   //Check if user have permission to the role
   return JSON.parse(decoded.permissions).some(permission => requiredPermissions.includes(permission))
  }
}