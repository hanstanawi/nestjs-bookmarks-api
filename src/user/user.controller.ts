import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtAuthGuard } from '../auth/guard';
import { UpdateUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@Controller({
  path: 'users',
})
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getUser(@GetUser() user: User) {
    return user;
  }

  @Patch()
  updateUser(@GetUser('id') userId: number, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(userId, dto);
  }
}
