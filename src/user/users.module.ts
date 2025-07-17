import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PayGateService } from 'src/common/services/pagate.service';
import { UserRepository } from './schema/user.repository';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OTPUsage,
  OTPUsageSchema,
  User,
  UserPin,
  UserPinSchema,
  UserSchema,
} from './schema/user.schema';
import {
  Business,
  BusinessSchema,
  Membership,
  MembershipSchema,
} from './schema/member-business.schema';
import { Teams, TeamSchema } from './schema/teams.schema';
import { PassowrdSchema, Password } from './schema/password.schema';
import { Login, LoginSchema } from './schema/login.schema';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { CreateTeamAction } from 'src/Actions/createTeamAction';
import { ApiResponse } from 'src/common/Helper/apiResponse';
import { ToggleLogin } from 'src/Actions/toggleLogin';
import {
  Permission,
  PermissionSchema,
  Role,
  RoleSchema,
} from './schema/roles-permission.schema';
import { GeneratePermission } from 'src/Actions/rolesAndPermission';

import { PostmarkService } from 'src/common/services/postmark.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: Password.name, schema: PassowrdSchema },
      { name: Login.name, schema: LoginSchema },
      { name: OTPUsage.name, schema: OTPUsageSchema },
      { name: Teams.name, schema: TeamSchema },
      { name: Role.name, schema: RoleSchema },
      { name: UserPin.name, schema: UserPinSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    GeneratePermission,
    PayGateService,
    CreateTeamAction,
    ToggleLogin,
    ApiResponse,
    UserRepository,
    PostmarkService,
  ],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        'api/v1/auth/user',
        'api/v1/auth/email-verification',
        'api/v1/auth/create-team-member',
        'api/v1/auth/create-pin',
        'api/v1/auth/verify-pin',
        'api/v1/auth/new-test',
        'api/v1/auth/send-otp',
        'api/v1/auth/verify-phone',
        'api/v1/auth/add-pin',
        'api/v1/auth/change-password',
        'api/v1/auth/add-pin',
        'api/v1/auth/change-pin',
        'api/v1/auth/create-admin',
        'api/v1/auth/users',
        'api/v1/auth/block-status',
        'api/v1/auth/business',
        'api/v1/auth/switch/business/:membershipId',
      );
  }
}
