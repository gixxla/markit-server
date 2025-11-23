import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Query,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
} from "@nestjs/common";
import { Public } from "src/decorators/public.decorator";
import { BookmarkService } from "./bookmark.service";
import { CreateBookmarkDto } from "./dto/create-bookmark.dto";
import { User } from "../entities/user.entity";
import { GetBookmarksDto } from "./dto/get-bookmarks.dto";
import { UpdateBookmarkDto } from "./dto/update-bookmark.dto";
import UserDeco from "../../decorators/user.decorator";

@Controller("bookmark")
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Public()
  @Get("fetch-title")
  @HttpCode(HttpStatus.OK)
  async fetchTitle(@Query("url") url: string): Promise<{ title: string }> {
    if (!url) {
      throw new BadRequestException("URL 쿼리 파라미터가 필요합니다.");
    }

    const title = await this.bookmarkService.fetchTitleFromUrl(url);

    return { title };
  }

  @Post()
  async createBookmark(@UserDeco() user: User, @Body() createBookmarkDto: CreateBookmarkDto) {
    return this.bookmarkService.create(user, createBookmarkDto);
  }

  @Get()
  async getBookmarks(@UserDeco() user: User, @Query() getBookmarksDto: GetBookmarksDto) {
    return this.bookmarkService.findAll(user, getBookmarksDto);
  }

  @Patch(":id")
  async updateBookmark(@UserDeco() user: User, @Param("id") id: string, @Body() updateDto: UpdateBookmarkDto) {
    return this.bookmarkService.update(user.id, id, updateDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBookmark(@UserDeco() user: User, @Param("id") id: string) {
    return this.bookmarkService.delete(user.id, id);
  }

  @Patch(":id/access")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateAccessTime(@UserDeco() user: User, @Param("id") id: string) {
    await this.bookmarkService.updateLastAccessedAt(user.id, id);
  }
}
