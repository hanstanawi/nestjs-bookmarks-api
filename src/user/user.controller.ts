import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtAuthGuard } from 'src/auth/guards';

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
