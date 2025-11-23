/* eslint-disable import/no-cycle */
import { Entity, PrimaryColumn, JoinColumn, ManyToOne } from "typeorm";
import { Bookmark } from "./bookmark.entity";
import { Tag } from "./tag.entity";

@Entity("bookmark_tag")
export class BookmarkTag {
  @ManyToOne(() => Bookmark, (bookmark) => bookmark.bookmarkTags, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bookmark_id" })
  bookmark: Bookmark;

  @PrimaryColumn({ name: "bookmark_id" })
  bookmarkId: string;

  @ManyToOne(() => Tag, (tag) => tag.bookmarkTags, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tag_id" })
  tag: Tag;

  @PrimaryColumn({ name: "tag_id" })
  tagId: string;
}
