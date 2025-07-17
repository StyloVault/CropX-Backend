import {
  IsArray,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';
import { AdminRole, UserRole } from '../interface/user.enum';

export class UserDataDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}

export class UserDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  userData: UserDataDto;

  userRole: string;

  @IsOptional()
  @IsString()
  referral: string

  referralCode: string;
}

export class UserPinDto {
  @IsString()
  @MinLength(4, { message: 'PIN must be at least 4 characters long' })
  @MaxLength(4, { message: 'PIN cannot be longer than 4 characters' })
  @Matches(/^(?!([0-9])\1{3})(?!1234|5678|4321|8765)\d{4}$/, {
    message: 'PIN must be strong',
  })
  pin: string;

  user: Types.ObjectId;
}

export class AdminDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(AdminRole)
  @IsNotEmpty({ message: 'Admin Role cannot be empty' })
  adminRole: string;
}

export class LoginDto {
  @IsString()
  loginId: string;

  @IsString()
  password: string;

  ipAddress: string;

  userAgent: object;

  @IsOptional()
  deviceToken: string;

  @IsOptional()
  deviceName: string;
}

export class verifyPhoneOTPDto {
  @IsString({ message: 'OTP ID must be provided' })
  otpId: string;

  @IsString({ message: 'OTP value cannot be empty' })
  otp: string;
}

export class PinDto {
  @IsNumberString()
  @MaxLength(4)
  @MinLength(4)
  pin: string;
}

export class changePinDto {
  @IsNumberString()
  @MaxLength(4)
  @MinLength(4)
  oldPin: string;

  @IsNumberString()
  @MaxLength(4)
  @MinLength(4)
  newPin: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;
}

export class NewPasswordDto {
  @IsStrongPassword()
  password: string;

  @IsString()
  otpId: string;

  @IsNumberString()
  otp: string;
}

export class UserBlockDto {
  @IsString({ message: 'Status should be block  or unblock' })
  blockStatus: string;

  @IsMongoId({ message: 'User ID must be valid' })
  userId: Types.ObjectId;
}

export class SetAdminRoleDto {
  @IsMongoId({ message: 'User ID must be valid' })
  userId: Types.ObjectId;

  @IsEnum(AdminRole)
  adminRole: string;
}

export class BusinessDetailsDto {
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  category: string;
  @IsString()
  description: string;
  @IsString()
  address: string;
  logoUrl: string;
  businessSignature: string;
  @IsString()
  registrationNumber: string;
  @IsString()
  registrationDate: string;
  @IsEmail()
  emailAddress: string;
  @IsPhoneNumber()
  phoneNumber: string;
}

export class UpdateBusinessDto {
  category: string;
  description: string;
  address: string;
  logoUrl: string;
  businessSignature: string;
  registrationNumber: string;
  registrationDate: string;
  emailAddress: string;
  phoneNumber: string;
}

export class UpdateUserDataDto {
  userImage: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  state: string;
  address: string;
}

export class NotificationDto {}

export class MemberDTO {
  @IsArray()
  @IsOptional()
  permissions: string[];

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  memberRole: string;
}

export class ToggleLoginDTO {
  @IsMongoId()
  id: string;

  @IsMongoId()
  sID: string;
}

export class UpdatePasswordDto {

  @IsString()
  newPassword: string;

  @IsString()
  oldPassword: string;
}