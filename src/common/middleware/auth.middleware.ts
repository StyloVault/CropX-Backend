import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { AppConfig } from './../../config.schema';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
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
    console.log('Decoded Token',decodedToken);
    const { sID, membershipId, userRole, adminRole, usage } = decodedToken;

    if (usage !== 'LOGIN' && usage !== 'TRANSPORT') {
      throw new UnauthorizedException('User not Authorized');
    }
  

    req.decoded = decodedToken;

    next();
  }
}
