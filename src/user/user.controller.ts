import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator/get-user.auth';
import { User } from 'knex/types/tables';
import { RemovePasswordInterceptor } from './user.interceptor';

@UseGuards(JwtGuard)
@Controller('api/v1/users')
@UseInterceptors(RemovePasswordInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  me(@GetUser() user: User) {
    return user;
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<User> {
    return await this.userService.getById(+id);
  }

  @Get()
  async getAll(): Promise<User[]> {
    return await this.userService.getAll();
  }
}
