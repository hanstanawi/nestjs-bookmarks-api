import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async updateUser(
    userId: number,
    { email, firstName, lastName }: UpdateUserDto,
  ) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ${email} email is not found`);
    }

    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
        email: true,
      },
      data: {
        email,
        firstName,
        lastName,
      },
    });
  }
}
