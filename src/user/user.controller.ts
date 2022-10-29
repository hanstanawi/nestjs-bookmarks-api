import { Controller, Get, Put, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtAuthGuard } from '../auth/guard';

@UseGuards(JwtAuthGuard)
@Controller({
  path: 'users',
})
export class UserController {
  @Get('me')
  getUser(@GetUser() user: User) {
    // if (!user) {
    //   throw new NotFoundException('User id not found');
    // }
    return user;
  }
}
