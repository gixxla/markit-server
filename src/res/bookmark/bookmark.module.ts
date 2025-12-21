import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookmarkController } from "./bookmark.controller";
import { BookmarkService } from "./bookmark.service";
import { Bookmark } from "../entities/bookmark.entity";
import { Tag } from "../entities/tag.entity";
import { BookmarkTag } from "../entities/bookmark-tag.entity";
import { TagModule } from "../tag/tag.module";
import { CategoryModule } from "../category/category.module";

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, Tag, BookmarkTag]), CategoryModule, TagModule],
  controllers: [BookmarkController],
  providers: [BookmarkService],
  exports: [BookmarkService],
})
export class BookmarkModule {}
