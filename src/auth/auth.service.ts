import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from './dto';
import * as argon from 'argon2';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}
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

    // return user (will be changed to jwt token)
    return existingUser;
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
}
