import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { GeneratePermission } from 'src/Actions/rolesAndPermission';
import { AppError } from 'src/common/errors/AppError';
import { Types } from 'mongoose';
import { UserRepository } from 'src/user/schema/user.repository';
import { MemberDTO } from 'src/user/dto/user.dto';
import { UserInterface } from 'src/user/interface/user.interface';

@Injectable()
export class CreateTeamAction {
  private data: object;

  constructor(
    private userRepository: UserRepository,
    private roleService: GeneratePermission,
  ) {}

  async execute(memberDto: MemberDTO, decoded: { sID: any; userId: any }) {
    let { sID, userId } = decoded;
    sID = new Types.ObjectId(sID);
    await this.roleService.createPermissions(memberDto.permissions);
    const user = await this.findUser(memberDto, userId, sID);

    const permissions = await this.checkRoleAndPermission(memberDto);
    let permissionsNames = permissions.map((permission) => {
      return permission.name;
    });

    if (memberDto.permissions.length > 0) {
      permissionsNames = permissionsNames.concat(memberDto.permissions);
    }
    return await this.processPayload(
      memberDto,
      user,
      permissionsNames,
      sID,
    ).createMember();
  }

  private async checkRoleAndPermission(memberDto: MemberDTO) {
    const role = await this.userRepository.getOneRole({
      name: memberDto.memberRole,
    });
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    if (memberDto.permissions) {
      const invalidPermissions = await this.roleService.validatePermissions(
        memberDto.permissions,
      );

      if (invalidPermissions) {
        throw new AppError(
          `The following permissions do not exist : ${invalidPermissions}`,
          404,
        );
      }
    }

    return role.permissions;
  }

  private async findUser(memberDto: MemberDTO, userId: any, sID: any) {
    const user = await this.userRepository.findUser({ email: memberDto.email });

    if (!user) {
      throw new Error("User doesn't exist");
    }

    if (user.id == userId) {
      throw new Error("Team member can't be the current user");
    }

    const existingMember = await this.userRepository.getOneTeam({
      user: user._id,
      business: sID,
    });

    if (existingMember) {
      throw new Error("The team member you're trying to create already exists");
    }

    return user;
  }

  private processPayload(
    memberDto: MemberDTO,
    user: UserInterface,
    permissions: string[],
    sID: any,
  ) {
    this.data = {
      user: user._id,
      memberRole: memberDto.memberRole,
      email: memberDto.email,
      phoneNumber: memberDto.phoneNumber,
      permissions: permissions,
      business: sID,
    };
    return this;
  }

  private async createMember() {
    const member = await this.userRepository.createMembers(this.data);

    if (!member) {
      throw new InternalServerErrorException(
        'Member cannot be created, try again later',
      );
    }
    return member;
  }
}
