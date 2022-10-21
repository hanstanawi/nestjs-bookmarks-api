import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller({
  path: 'users',
})
export class UserController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUser() {
    return { user: 'hello' };
  }
}
