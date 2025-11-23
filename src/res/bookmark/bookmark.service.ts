import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";
import * as cheerio from "cheerio";

import Bookmark from "../entities/bookmark.entity";
import Tag from "../entities/tag.entity";
import BookmarkTag from "../entities/bookmark-tag.entity";
import User from "../entities/user.entity";
import CreateBookmarkDto from "./dto/create-bookmark.dto";
import GetBookmarksDto from "./dto/get-bookmarks.dto";
import UpdateBookmarkDto from "./update-bookmark.dto";

@Injectable()
export default class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(BookmarkTag)
    private readonly bookmarkTagRepository: Repository<BookmarkTag>,
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
    const { url, title, tags } = createBookmarkDto;

    const newBookmark = this.bookmarkRepository.create({
      user,
      url,
      title,
      isReadLater: true,
    });

    const savedBookmark = await this.bookmarkRepository.save(newBookmark);

    if (tags && tags.length > 0) {
      const tagPromises = tags.map(async (tagName) => {
        let tag = await this.tagRepository.findOne({
          where: { name: tagName, userId: Number(user.id) },
        });

        if (!tag) {
          tag = this.tagRepository.create({
            name: tagName,
            userId: Number(user.id),
          });
          tag = await this.tagRepository.save(tag);
        }

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
    const { limit = 20, cursor, tag } = dto;

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
    const { tags, ...fieldsToUpdate } = updateDto;

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

    if (Object.keys(fieldsToUpdate).length > 0) {
      await this.bookmarkRepository.update(bookmarkId, fieldsToUpdate);
    }

    if (tags) {
      await this.bookmarkTagRepository.delete({ bookmarkId });

      if (tags.length > 0) {
        const tagPromises = tags.map(async (tagName) => {
          let tag = await this.tagRepository.findOne({
            where: { name: tagName, userId: Number(userId) },
          });

          if (!tag) {
            tag = this.tagRepository.create({
              name: tagName,
              userId: Number(userId),
            });
            tag = await this.tagRepository.save(tag);
          }

          return this.bookmarkTagRepository.create({
            bookmarkId,
            tagId: Number(tag.id),
          });
        });

        const newBookmarkTags = await Promise.all(tagPromises);
        await this.bookmarkTagRepository.save(newBookmarkTags);
      }
    }

    return this.bookmarkRepository.findOne({
      where: { id: String(bookmarkId) },
      relations: ["bookmarkTags", "bookmarkTags.tag"],
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
