import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfig, configValidationSchema } from './config.schema';
import { UsersModule } from './user/users.module';
import { v2 as cloudinary } from 'cloudinary';
import { UsersService } from './user/users.service';
import { UserRepository } from './user/schema/user.repository';
import { PayGateService } from './common/services/pagate.service';
import { Login, LoginSchema } from './user/schema/login.schema';
import {
  Business,
  BusinessSchema,
  Membership,
  MembershipSchema,
} from './user/schema/member-business.schema';
import { Password, PassowrdSchema } from './user/schema/password.schema';
import {
  User,
  UserSchema,
  OTPUsage,
  OTPUsageSchema,
  UserPin,
  UserPinSchema,
} from './user/schema/user.schema';
import mongoose from 'mongoose';
import { ConfigModule } from '@nestjs/config';
import { CreateTeamAction } from './Actions/createTeamAction';
import { ToggleLogin } from './Actions/toggleLogin';
import { ApiResponse } from './common/Helper/apiResponse';
import { TeamSchema, Teams } from './user/schema/teams.schema';
import { Permission, PermissionSchema, Role, RoleSchema } from './user/schema/roles-permission.schema';
import { GeneratePermission } from './Actions/rolesAndPermission';
import { PostmarkService } from './common/services/postmark.service';
import { InventoryModule } from './inventory/inventory.module';
import { ProductTransactionModule } from './product-transaction/product-transaction.module';
import { InvoiceModule } from './invoicing/invoice.module';
import { ItemModule } from './item/item.module';
import { ProductsNewsModule } from './product-news/product-news.module';
import { StorageModule } from './storage/storage.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CardsModule } from './cards/cards.module';
import { HooksModule } from './hooks/hooks.module';
import { CustomerModule } from './customer/customer.module';

if (AppConfig.APP_ENV === 'development') {
  mongoose.set('debug', true);
  mongoose.set('strictQuery', false);
}

const loggerMiddleware = (req: Request, res: Response, next: () => void) => {
  console.log(`Incoming Request - Method: ${req.method}, URL: ${req.url}`);
  next();
};
@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      envFilePath: [`.env`],
      validationSchema: configValidationSchema,
      isGlobal: true,
      expandVariables: true,
    }),
    MongooseModule.forRoot(AppConfig.MONGODB_URL),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: Password.name, schema: PassowrdSchema },
      { name: Login.name, schema: LoginSchema },
      { name: Teams.name, schema: TeamSchema },
      { name: OTPUsage.name, schema: OTPUsageSchema },
      {name : Role.name, schema : RoleSchema},
      {name : UserPin.name, schema : UserPinSchema},
      {name :  Permission.name, schema : PermissionSchema}
    ]),
    InventoryModule,
    ProductTransactionModule,
    InvoiceModule,
    ProductsNewsModule,
    StorageModule,
    TransactionsModule,
    CardsModule,
    CustomerModule,
    HooksModule,
    ItemModule,
  ],
  controllers: [AppController],
  providers: [AppService, GeneratePermission,PostmarkService,UsersService,CreateTeamAction, ToggleLogin,ApiResponse, UserRepository, PayGateService],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private userServices: UsersService) {}
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(loggerMiddleware).forRoutes('*');
  }

  async onModuleInit() {
    try {
      await this.userServices.createAdmin({
        phoneNumber: '09034444444',
        email: 'info@stylovault.com',
        firstName: 'Michael',
        lastName: 'Ojo',
        adminRole: 'Blogger',
      });
    } catch (error) {}
  }
}
