/* eslint-disable import/no-cycle */
import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import CommonEntity from "./common.entity";
import User from "./user.entity";
import Bookmark from "./bookmark.entity";

@Entity("category")
export default class Category extends CommonEntity {
  @ManyToOne(() => User, (user) => user.tags)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.category)
  bookmarks: Bookmark[];
}
