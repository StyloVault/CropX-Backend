import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorator/roles';
import { UserRolesGuard } from 'src/common/roles/user.roles';
import {
  AdminDto,
  BusinessDetailsDto,
  changePinDto,
  LoginDto,
  MemberDTO,
  NewPasswordDto,
  PinDto,
  ResetPasswordDto,
  SetAdminRoleDto,
  ToggleLoginDTO,
  UpdatePasswordDto,
  UpdateUserDataDto,
  UserBlockDto,
  UserDto,
  verifyPhoneOTPDto,
} from './dto/user.dto';
import { UserRole } from './interface/user.enum';
import { UsersService } from './users.service';
import { Permissions } from 'src/common/decorator/permission';
import { PermissionsGuard } from 'src/common/roles/permission.role';
import { Response } from 'express';

@Controller('api/v1/auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  createAccount(@Body() userDto: UserDto) {
    return this.usersService.createUser(userDto);
  }

  @Post('login')
  loginAccount(@Body() loginDto: LoginDto, @Req() req) {
    loginDto.ipAddress = req.ip;
    console.log(loginDto);
    return this.usersService.login(loginDto);
  }

  //User Access
  @Get('user')
  getDetails(@Req() req) {
    const { user } = req;
    return this.usersService.getUserDetails(user);
  }

  @Get('/new-test')
  @UseGuards(PermissionsGuard)
  @Permissions('can_not_create')
  newTest(@Req() req) {
    console.log(req.decoded);
    return 'done';
  }

  @Post('verify-pin')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  async verifyPin(@Req() req, @Res() res, @Body() body) {
    return await this.usersService.verifyPin(body, res);
  }
  @Post('create-pin')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  async createPin(@Req() req, @Res() res, @Body() body) {
    const { userId } = req.decoded;
    return await this.usersService.createPin(userId, body, res);
  }
  //User Access

  @Get('email-verification')
  @UseGuards(UserRolesGuard)
  @Roles(UserRole.USER, UserRole.COMPANY)
  resendEmail(@Req() req) {
    const { user } = req;
    return this.usersService.resendEmailVerification(user);
  }

  @Post('create-team-member')
  @UseGuards(UserRolesGuard)
  @Roles(UserRole.USER, UserRole.COMPANY)
  createTeamMember(@Req() req, @Body() body: MemberDTO, @Res() res: Response) {
    return this.usersService.createTeamMember(body, req.decoded, res);
  }

  @Post('new-login')
  toggleBusinessLogin(@Body() body: ToggleLoginDTO, @Res() res: Response) {
    return this.usersService.toggleBusinessLogin(body, res);
  }

  @Post('verify-email')
  verifyEmail(@Body() body) {
    const { token } = body;
    return this.usersService.emailVerification(token);
  }

  //User Access
  @Get('send-otp')
  sendPhoneOTP(@Req() req) {
    const { user } = req;
    return this.usersService.sendPhoneOTP(user);
  }

  //User Access
  @Post('verify-phone')
  verifyPhone(@Req() req, @Body() body: verifyPhoneOTPDto) {
    const { user } = req;
    return this.usersService.verifyPhoneOTP(body, user);
  }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.usersService.resetPassword(body);
  }

  @Post('new-password')
  newPassword(@Body() body: NewPasswordDto) {
    return this.usersService.newPassword(body);
  }

  @Post('change-password')
  @UseGuards(UserRolesGuard)
  updatePassword(@Req() req, @Body() body: UpdatePasswordDto) {
    const { user } = req;
    return this.usersService.updatePassword(user, body);
  }

  @Post('add-pin')
  @UseGuards(UserRolesGuard)
  addPin(@Body() body: PinDto, @Req() req) {
    const { user } = req;
    return this.usersService.addPin(body, user);
  }

  //User Access
  @Post('change-pin')
  @UseGuards(UserRolesGuard)
  changePin(@Body() body: changePinDto, @Req() req) {
    const { user } = req;
    return this.usersService.changePin(body, user);
  }

  //Admin Access
  @Post('create-admin')
  createAdmin(@Body() userDto: AdminDto) {
    return this.usersService.createAdmin(userDto);
  }

  //Admin Access
  @Get('users')
  getUsers(@Req() req, @Query() query) {
    const { user } = req;
    return this.usersService.getUserAdmin(user, query);
  }

  @Get('user/:id')
  getUserByID(@Param('id') id) {
    return this.usersService.getUserByID(id);
  }

  //Admin Access
  @Post('block-status')
  blockUnblock(@Req() req, @Body() body: UserBlockDto) {
    const { user } = req;
    return this.usersService.blockUnblockUser(user, body);
  }

  //Admin Access
  @Post('admin-role')
  setAdminRole(@Req() req, @Body() body: SetAdminRoleDto) {
    const { user } = req;
    return this.usersService.setAdminRole(user, body);
  }

  //User Access
  @Post('business')
  @UseInterceptors(AnyFilesInterceptor())
  addBusiness(@Req() req, @Body() body: BusinessDetailsDto) {
    const { user } = req;
    return this.usersService.addBusiness(user, body);
  }

  @Patch('business/:businessId')
  @UseInterceptors(AnyFilesInterceptor())
  updateBusiness(@Req() req, @Body() body: BusinessDetailsDto, @Param('businessId') businessId: string) {
    const { user } = req;
    return this.usersService.updateBusiness(user, body, businessId);
  }

  @Get('business')
  getBusiness(@Req() req, ) {
    const { user } = req;
    return this.usersService.getBusinesses(user);
  }

  @Get('switch/business/:membershipId')
  switchBusiness(@Req() req, @Param('membershipId') membershipId: string) {
    const { user } = req;
    return this.usersService.switchBusiness(user, membershipId);
  }

  @Patch('user')
  updateUserDetails(@Req() req, @Body() body: UpdateUserDataDto) {
    const { user } = req;
    return this.usersService.updateUserDetails(user, body);
  }

  @Get('all-businesses')
  getAllBusinesses(@Query() query) {
    return this.usersService.getAllBusinesses(query);
  }
}
