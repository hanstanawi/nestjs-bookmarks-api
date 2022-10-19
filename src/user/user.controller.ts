import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller({})
export class UserController {
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getUser() {
    return { user: 'hello' };
  }
}
