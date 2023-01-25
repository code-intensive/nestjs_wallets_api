import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { AccessToken, SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'knex/types/tables';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  protected readonly EMAIL_UNAVAILABLE = 'Email already in use';
  protected readonly INVALID_SIGN_IN_MESSAGE = 'Username or password incorrect';

  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async signIn(credentials: SignInDto): Promise<AccessToken> {
    const user = await this.userService.getByEmail(credentials.email, false);

    if (user === undefined) {
      throw new ConflictException(this.INVALID_SIGN_IN_MESSAGE);
    }

    if (!(await argon.verify(user.password, credentials.password))) {
      throw new BadRequestException(this.INVALID_SIGN_IN_MESSAGE);
    }

    return this.generateAccessToken(user.id, user.email);
  }

  async signUp(credentials: SignUpDto): Promise<User> {
    const user = await this.userService.getByEmail(credentials.email, false);

    if (user !== undefined) throw new ConflictException(this.EMAIL_UNAVAILABLE);

    const password = await argon.hash(credentials.password);
    return await this.userService.createUser({ ...credentials, password });
  }

  private async generateAccessToken(
    id: number,
    email: string,
  ): Promise<AccessToken> {
    const payload = { sub: id, email };

    const JwtSignOptions = {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
    };

    const access_token = await this.jwtService.signAsync(
      payload,
      JwtSignOptions,
    );

    return { access_token };
  }
}
