import { Injectable } from '@nestjs/common';
import { AppError } from 'src/common/errors/AppError';
import { UserRepository } from 'src/user/schema/user.repository';

@Injectable()
export class GeneratePermission {
  constructor(private userRepository: UserRepository) {}

  async generateModelPermissions(tableName: any) {
    const permissions = [
      `create-${tableName}`,
      `read-${tableName}`,
      `update-${tableName}`,
      `delete-${tableName}`,
    ];

    permissions.forEach(async (permission) => {
      await this.userRepository.createPermission({ name: permission });
    });
  }

  async createPermissions(permissions: Array<string> = []) {
    const invalidPermissions = await this.checkPermissions(permissions);

    if (invalidPermissions) {
      throw new AppError(
        `The following permissions exists : ${invalidPermissions}`,
        404,
      );
    }

    permissions.forEach(async (permission) => {
      await this.userRepository.createPermission({ name: permission });
    });
  }

  async createRole(role) {
    const exists = await this.userRepository.getOneRole({ name: role });

    if (exists) {
      throw new AppError('Role exists already', 400);
    }
    return await this.userRepository.createRole({ name: role });
  }

  async assignPermissionToRoles(permissions: string[], role: string) {
    const dbRole = await this.userRepository.getOneRole({ name: role });

    if (!dbRole) {
      throw new AppError('Role not found', 404);
    }
    const invalidPermissions = await this.validatePermissions(permissions);

    if (invalidPermissions) {
      throw new AppError(
        `The following permissions do not exist : ${invalidPermissions}`,
        404,
      );
    }

    const permissionsId = await Promise.all(
      permissions.map(async (permission) => {
        const dbPermission = await this.userRepository.getOnePermission({
          name: permission,
        });

        return dbPermission ?dbPermission._id : null;
      }),
    );

    await this.userRepository.updateRole(
      { _id: dbRole.id },
      { permissions: permissionsId },
    );
    return { dbRole, permissionsId };
  }

  async validatePermissions(permissions: string[]): Promise<string | null> {
    const invalidPermissions: string[] = [];

    // Validate each permission
    await Promise.all(
      permissions.map(async (permission) => {
        const exists = await this.userRepository.getOnePermission({
          name: permission,
        });

        if (!exists) {
          invalidPermissions.push(permission);
        }
      }),
    );

    return invalidPermissions.length > 0 ? invalidPermissions.join(', ') : null;
  }

  async checkPermissions(permissions: string[]): Promise<string | null> {
    const existingPermissions: string[] = [];

    // Validate each permission
    await Promise.all(
      permissions.map(async (permission) => {
        const exists = await this.userRepository.getOnePermission({
          name: permission,
        });

        if (exists) {
          existingPermissions.push(permission);
        }
      }),
    );

    return existingPermissions.length > 0
      ? existingPermissions.join(', ')
      : null;
  }

  async getRolesPermission(role: string) {
    const dbRole = await this.userRepository.getOneRole({ name: role });

    if (!dbRole) {
      throw new AppError('Role not found', 404);
    }

    return dbRole.permissions;
  }

  async getAllRoles() {
    const roles = await this.userRepository.getAllRoles();

    return roles;
  }

  async getAllPermissions() {
    const permissions = await this.userRepository.getAllPermissions();

    return permissions;
  }
}
