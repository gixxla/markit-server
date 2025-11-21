import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";
import * as cheerio from "cheerio";

import Bookmark from "../entities/bookmark.entity";
import Tag from "../entities/tag.entity";
import BookmarkTag from "../entities/bookmark-tag.entity";
import User from "../entities/user.entity";
import CreateBookmarkDto from "./create-bookmark.dto";
import GetBookmarksDto from "./get-bookmarks.dto";

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
}
