import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { CommonEntity } from "./common.entity";
import { User } from "./user.entity";
import { BookmarkTag } from "./bookmark-tag.entity";

@Entity("tag")
export class Tag extends CommonEntity {
  @Column({ type: "varchar", length: 100 })
  name: string;

  @ManyToOne(() => User, (user) => user.tags)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id" })
  userId: number;

  @OneToMany(() => BookmarkTag, (bookmarkTag) => bookmarkTag.tag)
  bookmarkTags: BookmarkTag[];
}
