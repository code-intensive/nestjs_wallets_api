import { AuthGuard } from '@nestjs/passport';
import { AuthStrategies } from '../strategy/auth.strategies';

export class JwtGuard extends AuthGuard(AuthStrategies.JWT) {
  constructor() {
    super();
  }
}
