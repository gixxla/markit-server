import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";
import * as cheerio from "cheerio";

import { Bookmark } from "../entities/bookmark.entity";
import { BookmarkTag } from "../entities/bookmark-tag.entity";
import { User } from "../entities/user.entity";
import { CreateBookmarkDto } from "./dto/create-bookmark.dto";
import { GetBookmarksDto } from "./dto/get-bookmarks.dto";
import { UpdateBookmarkDto } from "./dto/update-bookmark.dto";
import { TagService } from "../tag/tag.service";
import { CategoryService } from "../category/category.service";
import { LocalBookmarkDto } from "../auth/dto/local-bookmark.dto";
import { verifyAuthorization } from "../../common/helpers/authorization.helper";

@Injectable()
export class BookmarkService {
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

  async create(user: User, createBookmarkDto: CreateBookmarkDto): Promise<Bookmark> {
    const { url, title, tags, categoryId } = createBookmarkDto;

    if (categoryId) {
      await this.categoryService.validate(user.id, categoryId);
    }

    const newBookmark = this.bookmarkRepository.create({
      userId: user.id,
      url,
      title,
      isReadLater: false,
      categoryId,
    });

    const savedBookmark = await this.bookmarkRepository.save(newBookmark);

    if (tags && tags.length > 0) {
      const tagPromises = tags.map(async (tagName) => {
        const tag = await this.tagService.findOrCreateByName(user.id, tagName);

        return this.bookmarkTagRepository.create({
          bookmarkId: savedBookmark.id,
          tagId: tag.id,
        });
      });

      const newBookmarkTags = await Promise.all(tagPromises);
      await this.bookmarkTagRepository.save(newBookmarkTags);
    }

    return this.bookmarkRepository.findOne({
      where: { id: savedBookmark.id },
      relations: ["bookmarkTags", "bookmarkTags.tag", "category"],
    }) as Promise<Bookmark>;
  }

  async findAll(user: User, dto: GetBookmarksDto) {
    const { limit = 20, cursor, tagName, categoryName } = dto;

    const query = this.bookmarkRepository
      .createQueryBuilder("bookmark")
      .leftJoinAndSelect("bookmark.bookmarkTags", "bookmarkTags")
      .leftJoinAndSelect("bookmarkTags.tag", "tag")
      .leftJoinAndSelect("bookmark.category", "category")
      .where("bookmark.userId = :userId", { userId: user.id })
      .orderBy("bookmark.id", "DESC")
      .take(limit + 1);

    if (cursor) {
      query.andWhere("bookmark.id < :cursor", { cursor });
    }

    if (tagName) {
      query.andWhere("tag.name = :tagName", { tagName });
    }

    if (categoryName) {
      query.andWhere("category.name = :categoryName", { categoryName });
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
      category: bm.category?.name,
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

  async update(userId: string, bookmarkId: string, updateDto: UpdateBookmarkDto): Promise<Bookmark> {
    const { tags, ...data } = updateDto;

    const bookmark = await verifyAuthorization(this.bookmarkRepository, bookmarkId, userId, "북마크");

    const dataToUpdate = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as Partial<Bookmark>;

    if (dataToUpdate.categoryId) {
      await this.categoryService.validate(userId, dataToUpdate.categoryId);
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await this.bookmarkRepository.update(bookmarkId, dataToUpdate);
    }

    if (tags && tags.length > 0) {
      await this.bookmarkTagRepository.delete({ bookmarkId });

      const tagPromises = tags.map(async (tagName) => {
        const tag = await this.tagService.findOrCreateByName(userId, tagName);

        return this.bookmarkTagRepository.create({
          bookmarkId,
          tagId: tag.id,
        });
      });

      const newBookmarkTags = await Promise.all(tagPromises);
      await this.bookmarkTagRepository.save(newBookmarkTags);
    }

    return this.bookmarkRepository.findOne({
      where: { id: bookmarkId },
      relations: ["bookmarkTags", "bookmarkTags.tag", "category"],
    }) as Promise<Bookmark>;
  }

  async delete(userId: string, bookmarkId: string): Promise<void> {
    await verifyAuthorization(this.bookmarkRepository, bookmarkId, userId, "북마크");

    await this.bookmarkRepository.delete(bookmarkId);
  }

  async updateLastAccessedAt(userId: string, bookmarkId: string): Promise<void> {
    await verifyAuthorization(this.bookmarkRepository, bookmarkId, userId, "북마크");

    await this.bookmarkRepository.update(bookmarkId, { lastAccessedAt: new Date() });
  }

  async migrate(user: User, localBookmarkDto: LocalBookmarkDto): Promise<Bookmark> {
    const { url, title, tags, categoryName } = localBookmarkDto;

    let categoryId: string | undefined;
    if (categoryName) {
      const category = await this.categoryService.findOrCreateByName(user.id, categoryName);
      if (category) {
        categoryId = category.id;
      }
    }

    const newBookmark = this.bookmarkRepository.create({
      userId: user.id,
      url,
      title,
      isReadLater: false,
      categoryId,
    });

    const savedBookmark = await this.bookmarkRepository.save(newBookmark);

    if (tags && tags.length > 0) {
      const tagPromises = tags.map(async (tagName) => {
        const tag = await this.tagService.findOrCreateByName(user.id, tagName);

        return this.bookmarkTagRepository.create({
          bookmarkId: savedBookmark.id,
          tagId: tag.id,
        });
      });

      const newBookmarkTags = await Promise.all(tagPromises);
      await this.bookmarkTagRepository.save(newBookmarkTags);
    }

    return savedBookmark;
  }
}
