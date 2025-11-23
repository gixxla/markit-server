import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import BookmarkController from "./bookmark.controller";
import BookmarkService from "./bookmark.service";
import Bookmark from "../entities/bookmark.entity";
import Tag from "../entities/tag.entity";
import BookmarkTag from "../entities/bookmark-tag.entity";
import User from "../entities/user.entity";
import TagModule from "../tag/tag.module";
import CategoryModule from "../category/category.module";

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, Tag, BookmarkTag, User]), CategoryModule, TagModule],
  controllers: [BookmarkController],
  providers: [BookmarkService],
})
export default class BookmarkModule {}
