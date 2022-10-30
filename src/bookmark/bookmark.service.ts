import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Bookmark } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * @description Get array of bookmarks of an user
   * @param {number} userId user id
   * @returns array of bookmarks of an user, will return empty array if no user found
   */
  getBookmarks(userId: number): Promise<Bookmark[]> {
    return this.prismaService.bookmark.findMany({ where: { userId } });
  }

  /**
   * @description Get bookmark by id of an user
   * @param {number} bookmarkId bookmark id
   * @param {number} userId user id
   * @returns Found bookmark otherwise throw not found exception
   */
  async getBookmarkById(bookmarkId: number, userId: number): Promise<Bookmark> {
    const bookmark = await this.prismaService.bookmark.findFirst({
      where: { id: bookmarkId, userId: userId },
    });

    if (!bookmark) {
      throw new NotFoundException(`Bookmark with id ${bookmarkId} not found`);
    }

    return bookmark;
  }

  /**
   * @description create a new bookmark for a user
   * @param {number} userId user id
   * @param {CreateBookmarkDto} dto create bookmark data
   * @returns created bookmark
   */
  createBookmark(userId: number, dto: CreateBookmarkDto): Promise<Bookmark> {
    return this.prismaService.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  /**
   * @description update a bookmark by id for a certain user
   * @param {number} userId user id
   * @param {number} bookmarkId bookmark id
   * @param {UpdateBookmarkDto} dto
   * @returns updated bookmark or forbidden error
   */
  async updateBookmark(
    userId: number,
    bookmarkId: number,
    dto: UpdateBookmarkDto,
  ): Promise<Bookmark> {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    // check if user owns the bookmark
    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    return this.prismaService.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        userId,
        ...dto,
      },
    });
  }

  /**
   * @description remove bookmark by id
   * @param {number} userId user id
   * @param {number} bookmarkId bookmark id
   */
  async deleteBookmark(userId: number, bookmarkId: number): Promise<Bookmark> {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    // check if user owns the bookmark
    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    return this.prismaService.bookmark.delete({ where: { id: bookmarkId } });
  }
}
