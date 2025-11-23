import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import TagService from "./tag.service";
import TagController from "./tag.controller";
import Tag from "../entities/tag.entity";
import BookmarkTag from "../entities/bookmark-tag.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Tag, BookmarkTag])],
  controllers: [TagController],
  providers: [TagService],
})
export default class TagModule {}
