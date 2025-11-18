/* eslint-disable import/no-cycle */
import { Entity, Column, OneToMany, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import CommonEntity from "./common.entity";
import User from "./user.entity";
import Category from "./category.entity";
import BookmarkTag from "./bookmark-tag.entity";
import OfflineBookmark from "./offline-bookmark.entity";

@Entity("bookmark")
export default class Bookmark extends CommonEntity {
  @ManyToOne(() => User, (user) => user.tags)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ type: "text" })
  url: string;

  @Column({ type: "text" })
  title: string;

  @ManyToOne(() => Category, (category) => category.bookmarks, { nullable: true })
  @JoinColumn({ name: "category_id" })
  category: Category;

  @Column({ name: "category_id", nullable: true })
  categoryId: number;

  @Column({ name: "is_read_later", type: "boolean", default: true })
  isReadLater: boolean;

  @Column({ name: "is_offline_available", type: "boolean", default: false })
  isOfflineAvailable: boolean;

  @Column({ name: "last_accessed_at", type: "timestamp", nullable: true })
  lastAccessedAt: Date;

  @OneToMany(() => BookmarkTag, (bookmarkTag) => bookmarkTag.bookmark)
  bookmarkTags: BookmarkTag[];

  @OneToOne(() => OfflineBookmark, (offline) => offline.bookmark)
  offlineBookmark: OfflineBookmark;
}
