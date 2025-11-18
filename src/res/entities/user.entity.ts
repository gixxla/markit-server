/* eslint-disable import/no-cycle */
import { Entity, Column, OneToMany } from "typeorm";
import CommonEntity from "./common.entity";
import Bookmark from "./bookmark.entity";
import Category from "./category.entity";
import Tag from "./tag.entity";

@Entity("user")
export default class User extends CommonEntity {
  @Column({ name: "anonymous_id", type: "uuid", unique: true })
  anonymousId: string;

  @Column({ type: "varchar", nullable: true, unique: true })
  email: string | null;

  @Column({ name: "hashed_password", type: "varchar", nullable: true })
  hashedPassword: string | null;

  @Column({ name: "last_active_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  lastActiveAt: Date;

  @Column({ name: "is_registered", type: "boolean", default: false })
  isRegistered: boolean;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks: Bookmark[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Tag, (tag) => tag.user)
  tags: Tag[];
}
