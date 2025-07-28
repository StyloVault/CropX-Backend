import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
    UnprocessableEntityException,
  } from '@nestjs/common';
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
    UpdatePasswordDto,
    UpdateUserDataDto,
    UserBlockDto,
    UserDto,
    UserPinDto,
    verifyPhoneOTPDto,
  } from './dto/user.dto';
  import { UserRepository } from './schema/user.repository';
  import * as jwt from 'jsonwebtoken';
  import * as bcrypt from 'bcrypt';
  import { AppConfig } from 'src/config.schema';
  import {
    AdminRole,
    MemberStatus,
    OTPReason,
    UserRole,
    UserStatus,
  } from './interface/user.enum';
  import { MembershipInterface } from './interface/member-business.interface';
  import { UserInterface } from './interface/user.interface';
  import { PayGateService } from 'src/common/services/pagate.service';
  import { randomNumberGenerator } from 'src/common/utils/random-number';
  import { maskNumber } from 'src/common/utils/mask-number';
  import { CreateTeamAction } from 'src/Actions/createTeamAction';
  import { ApiResponse } from 'src/common/Helper/apiResponse';
  import { Response } from 'express';
  import { ToggleLogin } from 'src/Actions/toggleLogin';
  import { Types } from 'mongoose';
  
  import { PostmarkService } from 'src/common/services/postmark.service';
  import { OtpEmailTemplate } from 'src/common/email-templates/otp-email';
  
  @Injectable()
  export class UsersService {
    constructor(
      private readonly userRepository: UserRepository,
      private payGateService: PayGateService,
      private apiResponse: ApiResponse,
      private createTeamAction: CreateTeamAction,
      private toggleLogin: ToggleLogin,
      private postmarkService: PostmarkService,
    ) {}
  
    //Create user
  
    async createTeamMember(memberDto: MemberDTO, decoded: any, res: Response) {
      try {
        const member = await this.createTeamAction.execute(memberDto, decoded);
        console.log(member);
        return this.apiResponse.success(
          res,
          'Team member created successfully, invite link sent',
          member,
          201,
        );
      } catch (error) {
        return this.apiResponse.failure(res, error.message, [], error.statusCode);
      }
    }
  
    async createUser(userDto: UserDto) {
      userDto.userRole = UserRole.USER;
      const salt = await bcrypt.genSalt();
      userDto.password = await bcrypt.hash(userDto.password, salt);
      const newUser = await this.userRepository.createUser(userDto);
  
      if (!newUser) {
        throw new InternalServerErrorException(
          'User cannot be created, try again later',
        );
      }
  
      //create first business
      const business = await this.userRepository.createBusiness({
        emailAddress: userDto.email,
        phoneNumber: userDto.phoneNumber,
      });
  
      //Create Membership
      await this.userRepository.createMembership(
        newUser._id,
        business._id,
        true,
        UserStatus.ACTIVE,
      );
  
      //Send Email to activate Email.
  
      const jwtToken = await jwt.sign(
        {
          usage: 'EMAIL_VERIFICATION',
          emailAddress: newUser.email,
        },
        AppConfig.JWT_SECRET,
        {
          expiresIn: '24h',
        },
      );
  
      // Send Notification
      await this.payGateService.publishNotification({
        messages: [
          {
            data: Buffer.from(
              JSON.stringify({
                notificationReference: `NOTY_${Date.now()}_${randomNumberGenerator(
                  2,
                  3,
                )}`,
                environment:
                  AppConfig.NODE_ENV === 'development'
                    ? 'development'
                    : 'production',
                sender: 'CropX <hello@cropxchange.africa>',
                receivers: [newUser.email],
                subject: 'Verify Your Email Address',
                types: ['VERIFICATION'],
                channels: ['EMAIL'],
                company: 'SUDO',
                templateData: {
                  name: '',
                  title: 'Verify Your Email Address',
                  verification_url: `${AppConfig.APP_WEBSITE_URL}/verify-email/${jwtToken}`,
                },
              }),
            ).toString('base64'),
          },
        ],
      });
      return {
        statusCode: 200,
        message: 'User created successfully, email activation link sent',
        data: newUser,
      };
    }
  
    async createAdmin(userDto: AdminDto) {
      const { firstName, lastName, email, phoneNumber, adminRole } = userDto;
      const addUser = {
        email,
        phoneNumber,
        adminRole,
        userRole: UserRole.ADMIN,
        userData: { firstName, lastName },
      };
      const newUser = await this.userRepository.createUser(addUser);
      if (!newUser) {
        throw new InternalServerErrorException(
          'User cannot be created, try again later',
        );
      }
  
      //Send Email to activate Email.
  
      const jwtToken = await jwt.sign(
        {
          usage: 'ACTIVATE_ADMIN',
          emailAddress: newUser.email,
        },
        AppConfig.JWT_SECRET,
        {
          expiresIn: '24h',
        },
      );
  
      // Send Notification
      await this.payGateService.publishNotification({
        messages: [
          {
            data: Buffer.from(
              JSON.stringify({
                notificationReference: `NOTY_${Date.now()}_${randomNumberGenerator(
                  2,
                  3,
                )}`,
                environment:
                  AppConfig.NODE_ENV === 'development'
                    ? 'development'
                    : 'production',
                sender: 'Sudo <root@sudo.africa>',
                receivers: [newUser.email],
                subject: 'Verify Your Email Address',
                types: ['VERIFICATION'],
                channels: ['EMAIL'],
                company: 'SUDO',
                templateData: {
                  name: '',
                  title: 'Verify Your Email Address',
                  verification_url: `${AppConfig.APP_WEBSITE_URL}/verify-email/${jwtToken}`,
                },
              }),
            ).toString('base64'),
          },
        ],
      });
      return {
        statusCode: 200,
        message: 'User created successfully, email activation link sent',
        data: newUser,
      };
    }
    //Login User
  
    async login(loginDto: LoginDto) {
      const { loginId, password, ipAddress, userAgent, deviceToken, deviceName } =
        loginDto;
  
      const user = await this.userRepository.findUser({
        $or: [{ email: loginId }, { phoneNumber: loginId }],
      });
  
      if (!user) {
        throw new UnauthorizedException('Login Credential Mismatched');
      }
  
      if (user.blocked == true) {
        throw new UnauthorizedException(
          'Your account has been suspended, contact Admin',
        );
      }
  
      if (!user) {
        throw new UnauthorizedException('Check your credentials');
      }
      if (user.passwordBlock == true) {
        throw new UnauthorizedException('Account Locked contact support');
      }
      const validatePassword = await bcrypt.compare(password, user.password);
      if (!validatePassword) {
        const attempts = Number(user.passwordAttempt) + 1;
        let data: any;
        if (attempts >= 3) {
          data = { passwordAttempt: attempts, passwordBlock: true };
        } else {
          data = { passwordAttempt: attempts };
        }
        await this.userRepository.updateUser(user._id, data);
        const attemptLeft = 3 - attempts;
        const attempt = attemptLeft > 1 ? 'attempts' : 'attempt';
        throw new UnauthorizedException(
          `Credentials invalid, you have ${attemptLeft} ${attempt} left`,
        );
      }
  
      //Update password attemt to 0 and passwordBlock to false
      await this.userRepository.updateUser(user._id, {
        passwordAttempt: 0,
        passwordBlock: false,
      });
  
      //Verify User Device
      const deviceVerify = this.userRepository.findUser({
        _id: user._id,
        userDevice: {
          $elemMatch: {
            deviceToken,
            deviceName,
            deviceVerified: true,
            blackListDevice: false,
          },
        },
      });
  
      await this.userRepository.createLogin({
        user: user._id,
        userAgent,
        deviceName,
        ipAddress,
      });
  
      // if (user.userRole == UserRole.COMPANY) {
      const membership = await this.userRepository.getMembershipOne({
        user: user._id,
        isPrimary: true,
      });
      console.log(membership);
  
      const payload = {
        businessId: membership?.business._id,
        sID: membership?.business._id,
        userId: user._id,
        membershipId: membership?._id,
        userRole: user.userRole,
        adminRole: user?.adminRole,
        usage: 'LOGIN',
        business_name: membership?.business.name,
      };
      console.log(payload
        )
      const accessToken = await jwt.sign(payload, AppConfig.JWT_SECRET, {
        expiresIn: '60m',
      });
  
      const refreshPayload = {
        businessId: membership?.business._id,
        sID: membership?.business._id,
        userId: user._id,
        membershipId: membership?._id,
        userRole: user.userRole,
        usage: 'refresh',
        business_name: membership?.business.name,
      };
  
      const refreshToken = await jwt.sign(refreshPayload, AppConfig.JWT_SECRET, {
        expiresIn: '72h',
      });
  
      return {
        statusCode: 200,
        message: 'Login Successful',
        data: { accessToken, refreshToken, user },
      };
    }
  
    async toggleBusinessLogin(body: any, res: Response) {
      try {
        const data = await this.toggleLogin.execute(body);
        return this.apiResponse.success(res, 'Login Successfully', data, 200);
      } catch (error) {
        return this.apiResponse.failure(res, error.message, [], error.statusCode);
      }
    }
  
    async createPin(userId, userPinDto: UserPinDto, res) {
      const salt = await bcrypt.genSalt();
  
      const existingPin = await this.userRepository.findPin({ user: userId });
  
      if (existingPin) {
        return this.apiResponse.failure(res, 'User pin existing ', [], 400);
      }
  
      userPinDto.pin = await bcrypt.hash(userPinDto.pin, salt);
      userPinDto.user = userId;
  
      const pin = await this.userRepository.createPin(userPinDto);
      if (!pin) {
        return this.apiResponse.failure(
          res,
          'Pin cannot be created, try again later',
          [],
          400,
        );
      }
      return this.apiResponse.success(res, 'Success', { status: true }, 200);
    }
  
    async verifyPin(userPinDto: UserPinDto, res) {
      const userId = new Types.ObjectId(userPinDto.user);
      const userPin = await this.userRepository.findPin({
        user: userId,
      });
  
      if (!userPin) {
        return this.apiResponse.failure(res, 'Wrong Credentials', [], 400);
      }
  
      if (!userPin.user) {
        return this.apiResponse.failure(res, 'Wrong Credentials', [], 400);
      }
  
      if (userPin.pinBlock) {
        return this.apiResponse.failure(
          res,
          'Account Locked contact support',
          [],
          400,
        );
      }
  
      const validatePin = await bcrypt.compare(userPinDto.user, userPin.pin);
      if (!validatePin) {
        const attempts = Number(userPin.pinAttempt) + 1;
  
        let data: any;
        if (attempts >= 3) {
          data = { pinAttempt: attempts, pinBlock: true };
        } else {
          data = { pinAttempt: attempts };
        }
        await this.userRepository.updatePin({ user: userId }, data);
        const attemptLeft = 3 - attempts;
        const attempt = attemptLeft > 1 ? 'attempts' : 'attempt';
        return this.apiResponse.failure(
          res,
          `Wrong transaction pin, you have ${attemptLeft} ${attempt} left`,
          [],
          404,
        );
      }
      return this.apiResponse.success(res, 'Success', { status: true }, 200);
    }
    //Get User Details
    async getUserDetails(user: UserInterface) {
      let userDetails;
      if (user.userRole == UserRole.COMPANY) {
        const member = this.userRepository.getMembershipOne({
          user: user._id,
          isPrimary: true,
        });
        userDetails = { ...JSON.parse(JSON.stringify(user)), member };
      } else {
        userDetails = user;
      }
      return {
        statusCode: 200,
        message: 'User details fetched',
        data: userDetails,
      };
    }
  
    async resendEmailVerification(newUser: UserInterface) {
      console.log('Verify start');
      const jwtToken = await jwt.sign(
        {
          usage: 'EMAIL_VERIFICATION',
          emailAddress: newUser.email,
        },
        AppConfig.JWT_SECRET,
        {
          expiresIn: '24h',
        },
      );
  
      console.log(jwtToken);
      // Send Notification
      await this.payGateService.publishNotification({
        messages: [
          {
            data: Buffer.from(
              JSON.stringify({
                notificationReference: `NOTY_${Date.now()}_${randomNumberGenerator(
                  2,
                  3,
                )}`,
                environment:
                  AppConfig.NODE_ENV === 'development'
                    ? 'development'
                    : 'production',
                sender: 'Sudo <farm@stylovault.com>',
                receivers: [newUser.email],
                subject: 'Verify Your Email Address',
                types: ['VERIFICATION'],
                channels: ['EMAIL'],
                company: 'STYLOVAULT',
                templateData: {
                  name: newUser.userData?.firstName,
                  title: 'Verify Your Email Address',
                  verification_url: `${AppConfig.APP_WEBSITE_URL}/verify-email/${jwtToken}`,
                },
              }),
            ).toString('base64'),
          },
        ],
      });
  
      return {
        statusCode: 200,
        message: 'Email Verification resent successfully',
      };
    }
  
    //Activate Email
  
    async emailVerification(token: any) {
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, AppConfig.JWT_SECRET);
      } catch (error) {
        throw new UnauthorizedException();
      }
      if (decodedToken.usage !== 'EMAIL_VERIFICATION')
        throw new UnauthorizedException();
      const user = await this.userRepository.findUser({
        email: decodedToken.emailAddress,
      });
  
      if (!user) throw new UnauthorizedException();
      await this.userRepository.updateUser(user._id, { emailVerified: true });
      return { statusCode: 200, message: 'Email Verified Successfully' };
    }
  
    async findUserDetails(email: string, member: MembershipInterface) {
      const data = await this.userRepository.findUserProtected({ email });
      let membership: any;
      if (member) {
        membership = await this.userRepository.getMembershipOne({
          _id: member._id,
        });
      } else {
        membership = await this.userRepository.getMembershipOne({
          user: data?._id,
          isPrimary: true,
        });
      }
      const userObject: any = JSON.parse(JSON.stringify(data));
      userObject.membership = membership;
      return {
        statusCode: 200,
        message: 'User details fetch successfully',
        data: userObject,
      };
    }
    //Activate Phone Number
  
    async sendPhoneOTP(user: UserInterface) {
      const otp = randomNumberGenerator(100000, 999999);
      const otpStore = await this.userRepository.createOtp({
        user: user._id,
        otp,
        otpReason: OTPReason.PHONENUMBERVERIFICATION,
      });
      if (!otpStore)
        throw new UnprocessableEntityException('OTP not sent, try again');
  
      await this.payGateService.messagingNotification({
        messaging: {
          phoneNumber: user.phoneNumber,
          message: `Verify your phone number with One Time Password ${otp}`,
        },
      });
  
      return {
        statusCode: 200,
        message: `OTP sent to Phone Number ${maskNumber(user.phoneNumber)}`,
        data: {
          otpId: otpStore._id,
        },
      };
    }
  
    async verifyPhoneOTP(
      verifyPhoneOTPDto: verifyPhoneOTPDto,
      user: UserInterface,
    ) {
      const { otpId, otp } = verifyPhoneOTPDto;
  
      const currentDate = new Date();
      const thirtyMinutesAgo = new Date(currentDate.getTime() - 30 * 60000);
      const verifyOtp = await this.userRepository.findOneOtp({
        user: user._id,
        otp,
        _id: otpId,
        createdAt: { $gte: thirtyMinutesAgo },
      });
      if (!verifyOtp)
        throw new UnprocessableEntityException(
          'OTP Not verify, OTP is wrong or has expired',
        );
      const updatedUser = await this.userRepository.updateUser(verifyOtp._id, {
        phoneNumberVerified: true,
      });
  
      return {
        statusCode: 200,
        message: 'OTP Verification Successful',
      };
    }
  
    async updatePassword(user: UserInterface, body: UpdatePasswordDto) {
      const validatePassword = await bcrypt.compare(body.oldPassword, user.password);
      if (!validatePassword) {
        return {
          statusCode: 400,
          message: 'Current password is incorrect',
        }
      }
      const salt = await bcrypt.genSalt();
      const encryptPassword = await bcrypt.hash(body.newPassword, salt);
  
       await this.userRepository.updateUser(user._id, {
        password: encryptPassword,
        passwordUpdate: Date.now(),
        passwordAttempt: 0,
      });
      return {
        statusCode: 200,
        message: 'Password Updated Successfully',
      };
    }
    //Change Password
  
    async resetPassword(resetPasswordDto: ResetPasswordDto) {
      const user = await this.userRepository.findUser({
        email: resetPasswordDto.email,
      });
      if (!user) {
        throw new UnauthorizedException('User account not found');
      }
  
      const otp = randomNumberGenerator(100000, 999999);
      const otpStore = await this.userRepository.createOtp({
        user: user._id,
        otp,
        otpReason: OTPReason.PASSWORDRESET,
      });
      if (!otpStore)
        throw new UnprocessableEntityException('OTP not sent, try again');
  
      const htmlBody = OtpEmailTemplate({
        name: user.userData?.firstName,
        title: 'Reset Password',
        otp: otp,
      });
      const mailResponse = await this.postmarkService.sendEmail({
        to: user.email,
        from: 'CropX <hello@cropxchange.africa>',
        subject: 'Password Reset',
        htmlBody: htmlBody,
      });
  
      return {
        statusCode: 200,
        message: 'OTP sent to Email Address',
        data: {
          otpId: otpStore._id,
        },
      };
    }
  
    async newPassword(newPasswordDto: NewPasswordDto) {
      const { password, otpId, otp } = newPasswordDto;
  
      const currentDate = new Date();
      const thirtyMinutesAgo = new Date(currentDate.getTime() - 30 * 60000);
      const verifyOtp = await this.userRepository.findOneOtp({
        otp,
        _id: otpId,
        createdAt: { $gte: thirtyMinutesAgo },
        otpReason: OTPReason.PASSWORDRESET,
      });
      if (!verifyOtp)
        throw new UnprocessableEntityException('OTP is wrong or has expired');
      const salt = await bcrypt.genSalt();
      const encryptPassword = await bcrypt.hash(password, salt);
  
      const user = await this.userRepository.updateUser(verifyOtp.user, {
        password: encryptPassword,
        passwordUpdate: Date.now(),
        passwordAttempt: 0,
      });
      console.log('User', user);
      if (!user) {
        throw new UnprocessableEntityException(
          'Unable to reset password for user',
        );
      }
      const payload = { id: user._id, email: user.email, usage: 'LOGIN' };
      const token = await jwt.sign(payload, AppConfig.JWT_SECRET, {
        expiresIn: '15m',
      });
      return {
        statusCode: 200,
        message: 'Password Changed Successfully',
        accessToken: token,
      };
    }
  
    //Change Pin
    async addPin(pinDto: PinDto, user: UserInterface) {
      if (user.hasOwnProperty('pin'))
        throw new UnprocessableEntityException('Pin has been set');
      const salt = await bcrypt.genSalt();
      const encryptedPin = await bcrypt.hash(pinDto.pin, salt);
      const updatedUser = await this.userRepository.updateUser(user._id, {
        pin: encryptedPin,
      });
  
      return {
        statusCode: 200,
        message: 'Pin Successfully added',
      };
    }
  
    async pinVerify(pin, user: UserInterface) {
      const userData = await this.userRepository.findUser({ _id: user._id });
      if (!userData) return false;
      const valid = await bcrypt.compare(pin, userData.pin);
      if (!valid) return false;
      return true;
    }
  
    async changePin(changePinDto: changePinDto, user: UserInterface) {
      const { oldPin, newPin } = changePinDto;
      const comparePin = this.pinVerify(oldPin, user);
      if (!comparePin)
        throw new UnprocessableEntityException('Invalid Pin entered');
      const salt = await bcrypt.genSalt();
      const encryptedPin = await bcrypt.hash(newPin, salt);
      const updatedUser = await this.userRepository.updateUser(user._id, {
        pin: encryptedPin,
        pinUpdate: Date.now(),
      });
  
      return {
        statusCode: 200,
        message: 'Pin Successfully added',
      };
    }
  
    //Admin
  
    async getUserByID(id) {
      const userData = await this.userRepository.findUser({ _id: id });
      if (!userData) throw new NotFoundException('User Not found');
      return {
        statusCode: 200,
        message: 'User Found Successfully',
        data: userData,
      };
    }
  
    async getUserAdmin(user: UserInterface, searchQuery: any) {
      console.log(searchQuery);
      let query = {};
      if (searchQuery.userRole) {
        query = { ...query, userRole: searchQuery.userRole };
      }
      if (searchQuery.status && searchQuery.status != 'undefined') {
        query = { ...query, status: searchQuery.status };
      }
  
      return await this.userRepository.getUsers(query, searchQuery);
    }
  
    async blockUnblockUser(user: UserInterface, userBlockDto: UserBlockDto) {
      const validUser = await this.userRepository.findUser({
        _id: userBlockDto.userId,
      });
  
      if (!validUser) throw new NotFoundException('User not found');
      const blocked = userBlockDto.blockStatus == 'block' ? true : false;
      await this.userRepository.updateUser(validUser._id, { blocked });
      return { statusCode: 200, message: 'User status Updated Successfully' };
    }
  
    async setAdminRole(user: UserInterface, setAdminRoleDto: SetAdminRoleDto) {
      if (user?.adminRole !== AdminRole.SUPERADMIN) {
        throw new UnprocessableEntityException(
          'You have no priviledge to process',
        );
      }
  
      const validateAdmin = await this.userRepository.findUser({
        _id: setAdminRoleDto.userId,
        userRole: UserRole.ADMIN,
      });
  
      if (!validateAdmin)
        throw new NotFoundException('User not found within search constrain');
  
      await this.userRepository.updateUser(validateAdmin._id, {
        adminRole: setAdminRoleDto.adminRole,
        adminRoleUpdated: Date.now(),
      });
  
      return {
        statusCode: 200,
        message: 'Admin role updated Successfully',
      };
    }
  
    async addBusiness(
      user: UserInterface,
      businessDetailsDto: BusinessDetailsDto,
    ) {
      //Confirm if User has previous membership
      const confirmMember = await this.userRepository.getMembershipOne({
        user: user._id,
        isPrimary: true,
      });
      const isPrimary = confirmMember ? false : true;
      let business;
      if(confirmMember === null) {
        business = await this.userRepository.createBusiness(businessDetailsDto);
        await this.userRepository.createMembership(
          user._id,
          business._id,
          isPrimary,
          UserStatus.ACTIVE,
        );
  
        await this.userRepository.updateUser(user._id, {
          userRole: UserRole.COMPANY,
        });
      }else {

        if (!confirmMember?.business?.name) {
          business = await this.userRepository.updateBusiness(
            { _id: confirmMember?.business?._id },
            businessDetailsDto,
          );
          await this.userRepository.updateUser(user._id, {
            userRole: UserRole.COMPANY,
          });
        } else {
          business = await this.userRepository.createBusiness(businessDetailsDto);
          await this.userRepository.createMembership(
            user._id,
            business._id,
            isPrimary,
            UserStatus.ACTIVE,
          );
    
          await this.userRepository.updateUser(user._id, {
            userRole: UserRole.COMPANY,
          });
        }
      }
  
      //Create Membership
      //Set userRole to company
  
      return {
        statusCode: 200,
        message: 'Business added successfully',
      };
    }
  
    async updateBusiness(user, businessDetailsDto, businessId) {
      const membership = await this.userRepository.getMembershipOne({
        user: user._id,
        business: new Types.ObjectId(businessId)
      })
      const business = await this.userRepository.updateBusiness(
        { _id: businessId },
        businessDetailsDto,
      );
      return {
        statusCode: 200,
        message: 'Business Updated Successfully',
        data: business
      };
    }
    async getBusinesses(user: UserInterface) {
  
      const business = await this.userRepository.getMembershipMultiple({
        user: user._id,
      });
  
      return {
        statusCode: 200,
        message: 'Business Membership fetched Successfully',
        data: business,
      };
    }
  
    async getAllBusinesses(queryParams) {
      const { businessName, businessId, limit, page } = queryParams;
  
      let query = {};
  
      if (businessName) {
        query = { ...query, name: new RegExp(businessName, 'i') };
      }
  
      if (businessId) {
        query = { ...query, _id: businessId };
      }
  
      const business = await this.userRepository.getBusinessesPaginated(query, queryParams);
  
      return {
        statusCode: 200,
        message: 'Business Membership fetched Successfully',
        data: business,
      };
    }
  
    async updateUserDetails(
      user: UserInterface,
      updateUserDataDto: UpdateUserDataDto,
    ) {
      const updateUser = await this.userRepository.updateUser(user._id, {
        userData: updateUserDataDto,
      });
  
      return {
        statusCode: 200,
        message: 'User details Updated Successfully',
      };
    }
  
    async switchBusiness(user: UserInterface, membershipId: string) {
      //Check the membershipId
      const membership = await this.userRepository.getMembershipById(
        membershipId,
      );
  
      if (!membership) {
        throw new BadRequestException('You are not a member of this business');
      }
  
      const payload = {
        businessId: membership?.business._id,
        sID: membership?.business._id,
        userId: user._id,
        membershipId: membership?._id,
        userRole: user.userRole,
        adminRole: user?.adminRole,
        usage: 'LOGIN',
      };
  
      const accessToken = await jwt.sign(payload, AppConfig.JWT_SECRET, {
        expiresIn: '60m',
      });
  
      const refreshPayload = {
        businessId: membership?.business._id,
        sID: membership?.business._id,
        userId: user._id,
        membershipId: membership?._id,
        userRole: user.userRole,
        usage: 'refresh',
      };
  
      const refreshToken = await jwt.sign(refreshPayload, AppConfig.JWT_SECRET, {
        expiresIn: '72h',
      });
  
      return {
        statusCode: 200,
        message: 'Login Successful',
        data: { accessToken, refreshToken, user },
      };
    }
  }
  