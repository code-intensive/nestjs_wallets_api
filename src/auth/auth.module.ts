import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy';
import { UserService } from '../user/user.service';

@Module({
  providers: [AuthService, JwtStrategy, UserService],
  controllers: [AuthController],
  imports: [JwtModule.register({})],
})
export class AuthModule {}
