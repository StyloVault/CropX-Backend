import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/user/schema/user.repository';
import * as jwt from 'jsonwebtoken';
import { UserStatus } from 'src/user/interface/user.enum';
import { AppConfig } from 'src/config.schema';
import { AppError } from 'src/common/errors/AppError';

@Injectable()
export class ToggleLogin {
  constructor(private userRepository: UserRepository) {}

  async execute(body: any) {
    const { id, sID } = body;
    const user = await this.findUser(id);
    const { membership, team } = await this.getMemberOrTeam(user, sID);
    let payload: any;
    let refreshPayload: any;

    if (membership) {
      const data = this.setMembershipPayload(user, membership, sID);
      payload = data.payload;
      refreshPayload = data.refreshPayload;
    }

    if (team) {
      const data = this.setTeamPayload(user, team, sID);
      payload = data.payload;
      refreshPayload = data.refreshPayload;
    }

    const accessToken = await jwt.sign(payload, AppConfig.JWT_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = await jwt.sign(refreshPayload, AppConfig.JWT_SECRET, {
      expiresIn: '24h',
    });
    return { accessToken, refreshToken, user };
  }

  private setMembershipPayload(user, membership, sID) {
    this.handleInactiveOrSuspended(membership.status, 'MEMBER');
    const payload = {
      sID,
      userId: user._id,
      membershipId: membership._id,
      userRole: user.userRole,
      adminRole: user?.adminRole,
      usage: 'LOGIN',
      business_name: membership?.business.name
    };
    const refreshPayload = {
      sID,
      userId: user._id,
      membershipId: membership._id,
      userRole: user.userRole,
      usage: 'refresh',
      business_name: membership?.business.name
    };
    return { payload, refreshPayload };
  }

  private setTeamPayload(user, team, sID) {
    this.handleInactiveOrSuspended(team.accountStatus, 'TEAM');
    const payload = {
      sID,
      userId: user._id,
      teamId: team.id,
      userRole: team.memberRole,
      permissions: JSON.stringify(team.permissions),
      usage: 'LOGIN',
      business_name: team?.business.name
    };
    const refreshPayload = {
      sID,
      userId: user._id,
      teamId: team.id,
      userRole: team.memberRole,
      permissions: JSON.stringify(team.permissions),
      usage: 'refresh',
      business_name: team?.business.name
    };
    return { payload, refreshPayload };
  }

  private async findUser(id: string) {
    const user = await this.userRepository.findUser({
      _id: id,
    });

    if (!user) {
      throw new AppError("Your account doesn't exist", 404);
    }

    if (user.blocked) {
      throw new AppError('Your account has been suspended, contact Admin', 400);
    }
    return user;
  }

  private async getMemberOrTeam(user, sID) {
    const membership = await this.userRepository.getMembershipOne({
      user: user._id,
      business: sID,
    });

    const team = await this.userRepository.getOneTeam({
      user: user._id,
      business: sID,
    });

    if (!membership && !team) {
      throw new AppError('Business does not exist', 400);
    }

    return { membership, team };
  }

  private handleInactiveOrSuspended = (status: string, type) => {
    const inactive =
      type == 'MEMBER'
        ? 'Your Business is not active, contact Admin'
        : 'You are currently not active on this business';
    const suspended =
      type == 'MEMBER'
        ? 'Your Business account has been suspended, contact Admin'
        : 'You are currently suspended on this business';

    if (status === UserStatus.INACTIVE) {
      throw new AppError(inactive, 401);
    }

    if (status === UserStatus.SUSPENDED) {
      throw new AppError(suspended, 401);
    }
  };
}
