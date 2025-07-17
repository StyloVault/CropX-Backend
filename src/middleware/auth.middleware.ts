import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { AppConfig } from 'src/config.schema';
import { UserRepository } from 'src/user/schema/user.repository';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private userRepository: UserRepository) { }
  async use(req: any, res: any, next: () => void) {
    // check header or url parameters or post parameters for token
    const token = req.headers['Authorization'] || req.headers['authorization'];

    if (!token)
      throw new UnauthorizedException(
        'You are not allowed to access information',
      );

    let decodedToken;

    try {
      decodedToken = await jwt.verify(token.substr(7), AppConfig.JWT_SECRET);
    } catch (err) {
      decodedToken = null;
    }

    if (decodedToken == null)
      throw new UnauthorizedException('Token not valid for resource');
    const { sID, userId, membershipId, userRole, usage } = decodedToken;

    if (usage !== 'LOGIN' && usage !== 'TRANSPORT') {
      throw new UnauthorizedException('User not Authorized');
    }

    if (usage == 'LOGIN') {
      const user = await this.userRepository.findUser({
        _id: new Types.ObjectId(userId),
      });

      if (!user) throw new UnauthorizedException('User Not found');

      req.user = user
      decodedToken.userId = new Types.ObjectId(userId);
      decodedToken.membershipId = new Types.ObjectId(membershipId)
    }

    decodedToken.sID = new Types.ObjectId(sID)
    console.log(decodedToken)
    req.decoded = decodedToken;
    next();
  }
}
