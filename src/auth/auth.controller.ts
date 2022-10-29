import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto';
import { LoginDto } from './dto/login.dto';
import { IToken } from './type';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto): Promise<IToken> {
    return this.authService.login(dto);
  }

  @Post('signup')
  signup(@Body() dto: SignupDto): Promise<IToken> {
    return this.authService.signup(dto);
  }
}
