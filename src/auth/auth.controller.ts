import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, AccessToken, SignUpDto } from './dto';
import { User } from 'knex/types/tables';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() credentials: SignInDto): Promise<AccessToken> {
    return await this.authService.signIn(credentials);
  }

  @Post('sign-up')
  async signUp(@Body() credentials: SignUpDto): Promise<User> {
    return await this.authService.signUp(credentials);
  }
}
