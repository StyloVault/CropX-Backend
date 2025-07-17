import Bugsnag from '@bugsnag/js';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  BusinessInterface,
  MembershipInterface,
} from '../interface/member-business.interface';
import {
  LoginInterface,
  PasswordInterface,
} from '../interface/password-login.interface';
import { OTPInterface, UserInterface } from '../interface/user.interface';
import { Login } from './login.schema';
import { Business, Membership } from './member-business.schema';
import { Password } from './password.schema';
import { OTPUsage, User, UserPin } from './user.schema';
import { Teams } from './teams.schema';
import { Permission, Role } from './roles-permission.schema';
import { UserPinDto } from '../dto/user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserInterface>,
    @InjectModel(Membership.name)
    private membershipModel: Model<MembershipInterface>,
    @InjectModel(Business.name) private businessModel: Model<BusinessInterface>,
    @InjectModel(Teams.name) private teamModel: Model<Teams>,
    @InjectModel(Permission.name) private permissionModel : Model<Permission>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(UserPin.name) private userPinModel: Model<UserPin>,
    @InjectModel(Password.name) private passwordModel: Model<PasswordInterface>,
    @InjectModel(Login.name)
    private loginModel: SoftDeleteModel<LoginInterface>,
    @InjectModel(OTPUsage.name) private otpModel: Model<OTPInterface>,
  ) {}

  async createUser(user: any): Promise<UserInterface> {
    try {
      const newUser = await new this.userModel(user).save();
      return newUser;
    } catch (error) {
      if (error.code == 11000) {
        if (Object.keys(error.keyPattern)[0] == 'phoneNumber') {
          throw new BadRequestException('Phone Number Must be Unique');
        } else if (Object.keys(error.keyPattern)[0] == 'email') {
          throw new BadRequestException('Email Must be Unique');
        } else {
          throw new InternalServerErrorException('Error Inserting user');
        }
      } else {
        Bugsnag.notify(error);
        console.log(error);
        throw new InternalServerErrorException(
          'Unable to Create User at the moment',
        );
      }
    }
  }

  async updateUser(id, data: any) {
    try {
      const user = await this.userModel.findOneAndUpdate({ _id: id }, data, {
        new: true,
      });
      return user;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  async getMembershipById(membership_id) {
    return await this.membershipModel
      .findById(membership_id)
      .populate('business')
      .populate('user')
      .exec();
  }

  async createMembership(
    user: UserInterface,
    business: BusinessInterface,
    isPrimary = false,
    status: any,
  ) {
    try {
      const member = await new this.membershipModel({
        user: user._id,
        business: business._id,
        status,
        isPrimary,
      }).save();
      return member;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Unable to create membership for Company',
      );
    }
  }

  async getMembershipMultiple(data) {
    return await this.membershipModel
      .find(data)
      .populate('business')
      .populate('user')
      .exec();
  }

  async getMembershipOne(data) {
    return await this.membershipModel
      .findOne(data)
      .populate('business')
      .populate('user')
      .exec();
  }

  async updateMembership(search, data) {
    try {
      return await this.membershipModel
        .findOneAndUpdate(search, data, { new: true })
        .populate('business')
        .populate('user')
        .exec();
    } catch (error) {
      throw new ConflictException('Unable to update User');
    }
  }

  async createBusiness(businessInfo) {
    try {
      const business = await new this.businessModel(businessInfo).save();
      return business;
    } catch (error) {
      throw new InternalServerErrorException('Unable to create Business');
    }
  }
  async getBusinessById(business_id) {
    return await this.businessModel.findById(business_id).exec();
  }

  async getBusinessOne(data) {
    return await this.businessModel.findOne(data).exec();
  }

  async getBusinessMultiple(data) {
    return await this.businessModel.find(data).exec();
  }

  async getBusinessesPaginated(data, queryParams) {
    try {
      const subUser = this.businessModel.find(data);
      let { page, limit } = queryParams;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const skip = (page - 1) * limit;

      // const userData = [];
      const userData = await subUser.skip(skip).limit(limit).sort('-createdAt');

      
      const totalNum = await this.userModel.where(data).count();

      const numOfPages = Math.ceil(totalNum / limit);

      return {
        statusCode: 200,
        message: 'Businesses fetched successfully',
        data: userData,
        totalNum,
        numOfPages,
      };
    } catch (error) {
      console.log(error);
      Bugsnag.notify(error);
      throw new InternalServerErrorException('Unable to process transaction');
    }
  }

  async updateBusiness(search, data) {
    try {
      return await this.businessModel.findOneAndUpdate(search, data, {
        new: true,
      });
    } catch (error) {
      throw new InternalServerErrorException('Unable to update Business');
    }
  }

  async updatePassword(id, password){
    try {
      const user = await this.userModel.findOneAndUpdate(
        { _id: id },
        { password },
      );
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Password change not Successful');
    }
  }
  async updatePin(search, data) {
    try {
      const userPin = await this.userPinModel.findOneAndUpdate(
        search,
        data,
      );
      return userPin;
    } catch (error) {
      throw new InternalServerErrorException('Pin change not Successful');
    }
  }

  async createPin(data) {
    const newPin = await new this.userPinModel(data).save();
    return newPin;
  }
  async findPin(data: any){
    return await this.userPinModel.findOne(data).populate('user').exec();
  }

  async findUser(data: any): Promise<UserInterface> {
    return await this.userModel.findOne(data).select('+pin +password');
  }

  async findUserMultiple(data: any) {
    return await this.userModel.find(data).select('+pin +password');
  }

  async findUndeleted(data: any): Promise<UserInterface[]> {
    return await this.userModel.find(data).select('+pin +password');
  }

  async findUserProtected(data: any){
    const user = await this.userModel.findOne(data);
    return user;
  }

  async deleteUser(user: UserInterface) {
    return await this.userModel.softDelete({ _id: user._id });
  }

  async restoreUser(user: UserInterface) {
    return await this.userModel.restore({ _id: user._id });
  }

  async insertPassword(old_password, user) {
    try {
      return await new this.passwordModel({
        user_id: user._id,
        password: old_password,
      }).save();
    } catch (error) {
      return false;
    }
  }

  async getPasswords(user) {
    try {
      return await this.passwordModel
        .find({ user_id: user._id })
        .select('password')
        .limit(3)
        .sort('-createdAt');
    } catch (error) {
      return [];
    }
  }

  async createLogin(data) {
    try {
      return await new this.loginModel(data).save();
    } catch (error) {
      return false;
    }
  }

  async createOtp(data) {
    try {
      return await new this.otpModel(data).save();
    } catch (error) {
      return false;
    }
  }

  async findOneOtp(data) {
    return await this.otpModel.findOne(data).exec();
  }
 
    
  async updateMembers(search, data) {
    try {
        return await this.teamModel.findOneAndUpdate(search, data, {
           new: true,
       });
    } catch (error) {
      throw new InternalServerErrorException('Members change not Successful');
    }
  }

  async createMembers(data) {
    const newMember = await new this.teamModel(data).save();
    return newMember;
  }

  async createRole(data) {
    const newRole = await new this.roleModel(data).save();
    return newRole;
  }

  async createPermission(data) {
    const newPermission = await new this.permissionModel(data).save();
    return newPermission;
  }
  async getOneTeam(data: any) {
    return await this.teamModel
      .findOne(data)
      .populate('business')
      .populate('user')
      .exec();
  }

  async getOnePermission(data) {
    return await this.permissionModel.findOne(data).exec();
  }
  
  async getOneRole(data) {
    return await this.roleModel.findOne(data).populate('permissions').exec();
  }
  

  async updateRole(search, data) {
    try {
      return await this.roleModel.findOneAndUpdate(search, data, {
        new: true,
      });
    } catch (error) {
      throw new InternalServerErrorException('Unable to update role');
    }
  }

  async updatePermission(search, data) {
    try {
      return await this.businessModel.findOneAndUpdate(search, data, {
        new: true,
      });
    } catch (error) {
      throw new InternalServerErrorException('Unable to update permission');
    }
  }

  async getAllPermissions() {
    const permissions = await this.permissionModel.find().select('name');

    return permissions;
  }

  async getAllRoles() {
    const roles = await this.roleModel.find();

    return roles;
  }

  async getUsers(data, query) {
    try {
      const subUser = this.userModel.find(data);
      let { page, limit } = query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const skip = (page - 1) * limit;

      // const userData = [];
      const userData = await subUser.skip(skip).limit(limit).sort('-createdAt');

      // for (const item of output) {
      //   userData.push(item);
      // }
      const totalNum = await this.userModel.where(data).count();

      const numOfPages = Math.ceil(totalNum / limit);

      return {
        statusCode: 200,
        message: 'Requested Users fetched successfully',
        data: userData,
        totalNum,
        numOfPages,
      };
    } catch (error) {
      console.log(error);
      Bugsnag.notify(error);
      throw new InternalServerErrorException('Unable to process transaction');
    }
  }
}
