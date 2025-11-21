import { BadRequestException, Controller, HttpCode, HttpStatus, Query, Get, Post, Body } from "@nestjs/common";
import { Public } from "src/decorators/public.decorator";
import BookmarkService from "./bookmark.service";
import CreateBookmarkDto from "./create-bookmark.dto";
import UserDeco from "../../decorators/user.decorator";
import User from "../entities/user.entity";
import GetBookmarksDto from "./get-bookmarks.dto";

@Controller("bookmark")
export default class BookmarkController {
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
    return this.bookmarkService.createBookmark(user, createBookmarkDto);
  }

  @Get()
  async getBookmarks(@UserDeco() user: User, @Query() getBookmarksDto: GetBookmarksDto) {
    return this.bookmarkService.GetBookmarks(user, getBookmarksDto);
  }
}
