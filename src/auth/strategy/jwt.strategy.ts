import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthStrategies } from './auth.strategies';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  AuthStrategies.JWT,
) {
  constructor(config: ConfigService, private userService: UserService) {
    super({
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any) {
    const user = await this.userService.getByEmail(payload.email, false);
    if (!user) return null;
    return user;
  }
}
