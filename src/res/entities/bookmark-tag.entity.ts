/* eslint-disable import/no-cycle */
import { Entity, PrimaryColumn, JoinColumn, ManyToOne } from "typeorm";
import Bookmark from "./bookmark.entity";
import Tag from "./tag.entity";

@Entity("bookmark_tag")
export default class BookmarkTag {
  @ManyToOne(() => Bookmark, (bookmark) => bookmark.bookmarkTags)
  @JoinColumn({ name: "bookmark_id" })
  bookmark: Bookmark;

  @PrimaryColumn({ name: "bookmark_id" })
  bookmarkId: number;

  @ManyToOne(() => Tag, (tag) => tag.bookmarkTags)
  @JoinColumn({ name: "tag_id" })
  tag: Tag;

  @PrimaryColumn({ name: "tag_id" })
  tagId: number;
}
