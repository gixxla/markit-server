import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { CommonEntity } from "./common.entity";
import { Bookmark } from "./bookmark.entity";

@Entity("offline_bookmark")
export class OfflineBookmark extends CommonEntity {
  @OneToOne(() => Bookmark, (bookmark) => bookmark.offlineBookmark)
  @JoinColumn({ name: "bookmark_id" })
  bookmark: Bookmark;

  @Column({ name: "bookmark_id", unique: true })
  bookmarkId: number;

  @Column({ type: "text" })
  data: string;

  @Column({ type: "varchar", length: 20 })
  dataType: string;
}
