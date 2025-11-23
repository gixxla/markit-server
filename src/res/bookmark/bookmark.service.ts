import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";
import * as cheerio from "cheerio";

import Bookmark from "../entities/bookmark.entity";
import BookmarkTag from "../entities/bookmark-tag.entity";
import User from "../entities/user.entity";
import CreateBookmarkDto from "./dto/create-bookmark.dto";
import GetBookmarksDto from "./dto/get-bookmarks.dto";
import UpdateBookmarkDto from "./dto/update-bookmark.dto";
import TagService from "../tag/tag.service";
import CategoryService from "../category/category.service";

@Injectable()
export default class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(BookmarkTag)
    private readonly bookmarkTagRepository: Repository<BookmarkTag>,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
  ) {}

  async fetchTitleFromUrl(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      const $ = cheerio.load(data);
      const title = $("title").text().trim();

      return title || url;
    } catch (error) {
      console.error(`Failed to fetch title for ${url}:`, error);
      return url;
    }
  }

  async createBookmark(user: User, createBookmarkDto: CreateBookmarkDto): Promise<Bookmark> {
    const { url, title, tags, categoryId } = createBookmarkDto;

    if (categoryId) {
      await this.categoryService.validateCategory(user.id, categoryId);
    }

    const newBookmark = this.bookmarkRepository.create({
      user,
      url,
      title,
      isReadLater: true,
      categoryId,
    });

    const savedBookmark = await this.bookmarkRepository.save(newBookmark);

    if (tags && tags.length > 0) {
      const tagPromises = tags.map(async (tagName) => {
        const tag = await this.tagService.findOrCreateByName(user.id, tagName);

        return this.bookmarkTagRepository.create({
          bookmarkId: Number(savedBookmark.id),
          tagId: Number(tag.id),
        });
      });

      const newBookmarkTags = await Promise.all(tagPromises);
      await this.bookmarkTagRepository.save(newBookmarkTags);
    }

    return savedBookmark;
  }

  async GetBookmarks(user: User, dto: GetBookmarksDto) {
    const { limit = 20, cursor, tag, categoryId } = dto;

    const query = this.bookmarkRepository
      .createQueryBuilder("bookmark")
      .leftJoinAndSelect("bookmark.bookmarkTags", "bookmarkTags")
      .leftJoinAndSelect("bookmarkTags.tag", "tag")
      .where("bookmark.userId = :userId", { userId: user.id })
      .orderBy("bookmark.id", "DESC")
      .take(limit + 1);

    if (cursor) {
      query.andWhere("bookmark.id < :cursor", { cursor });
    }

    if (tag) {
      query.andWhere("tag.name = :tagName", { tagName: tag });
    }

    if (categoryId) {
      query.andWhere("bookmark.categoryId = :categoryId", { categoryId });
    }

    const bookmarks = await query.getMany();

    let hasNextPage = false;
    let nextCursor: string | null = null;

    if (bookmarks.length > limit) {
      hasNextPage = true;
      bookmarks.pop();
      nextCursor = bookmarks[bookmarks.length - 1].id;
    }

    const items = bookmarks.map((bm) => ({
      ...bm,
      tags: bm.bookmarkTags.map((bt) => bt.tag.name),
      bookmarkTags: undefined,
    }));

    return {
      data: items,
      meta: {
        hasNextPage,
        nextCursor,
        limit,
      },
    };
  }

  async updateBookmark(userId: string, bookmarkId: number, updateDto: UpdateBookmarkDto): Promise<Bookmark> {
    const { tags, ...dataToUpdate } = updateDto;

    const bookmark = await this.bookmarkRepository.findOne({
      where: { id: String(bookmarkId) },
      relations: ["user"],
    });

    if (!bookmark) {
      throw new NotFoundException("북마크를 찾을 수 없습니다.");
    }

    if (bookmark.user.id !== userId) {
      throw new ForbiddenException("이 북마크를 수정할 권한이 없습니다.");
    }

    if (dataToUpdate.categoryId) {
      await this.categoryService.validateCategory(userId, dataToUpdate.categoryId);
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await this.bookmarkRepository.update(bookmarkId, dataToUpdate);
    }

    if (tags && tags.length > 0) {
      await this.bookmarkTagRepository.delete({ bookmarkId });

      const tagPromises = tags.map(async (tagName) => {
        const tag = await this.tagService.findOrCreateByName(userId, tagName);

        return this.bookmarkTagRepository.create({
          bookmarkId: Number(bookmarkId),
          tagId: Number(tag.id),
        });
      });

      const newBookmarkTags = await Promise.all(tagPromises);
      await this.bookmarkTagRepository.save(newBookmarkTags);
    }

    return this.bookmarkRepository.findOne({
      where: { id: String(bookmarkId) },
      relations: ["bookmarkTags", "bookmarkTags.tag", "category"],
    }) as Promise<Bookmark>;
  }

  async deleteBookmark(userId: string, bookmarkId: number): Promise<void> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { id: String(bookmarkId) },
      relations: ["user"],
    });

    if (!bookmark) {
      throw new NotFoundException("북마크를 찾을 수 없습니다.");
    }

    if (bookmark.user.id !== userId) {
      throw new ForbiddenException("이 북마크를 삭제할 권한이 없습니다.");
    }

    await this.bookmarkRepository.delete(bookmarkId);
  }
}
