import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto';
import * as argon from 'argon2';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login({ email, password }: LoginDto) {
    // find user by email
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    // if user not found, throw exception
    if (!existingUser) {
      throw new NotFoundException('Unknown credentials');
    }

    // compare password
    const isMatch = await argon.verify(existingUser.hash, password);

    // if password incorrect, throw exception
    if (!isMatch) {
      throw new ForbiddenException('Unknown credentials');
    }

    return this.signToken(existingUser.id, email);
  }

  async signup({
    email,
    password,
    firstName,
    lastName,
  }: SignupDto): Promise<Partial<User>> {
    const hash = await argon.hash(password);

    try {
      const user = await this.prismaService.user.create({
        data: {
          email,
          hash,
          firstName,
          lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: !!firstName,
          lastName: !!lastName,
          createdAt: true,
          updatedAt: true,
        },
      });
      return user;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Email already existed');
        }
      }
      throw err;
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const data = {
      sub: userId,
      email,
    };

    const secret = this.configService.get('JWT_SECRET');

    const token = await this.jwtService.signAsync(data, {
      secret,
      expiresIn: '15m',
    });

    return {
      access_token: token,
    };
  }
}
