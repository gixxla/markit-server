import { Entity, PrimaryColumn, ManyToOne } from "typeorm";
import { Bookmark } from "./bookmark.entity";
import { Tag } from "./tag.entity";

@Entity("bookmark_tag")
export class BookmarkTag {
  @PrimaryColumn()
  bookmarkId: number;

  @PrimaryColumn()
  tagId: number;

  @ManyToOne(() => Bookmark, (bookmark) => bookmark.bookmarkTags)
  bookmark: Bookmark;

  @ManyToOne(() => Tag, (tag) => tag.bookmarkTags)
  tag: Tag;
}
