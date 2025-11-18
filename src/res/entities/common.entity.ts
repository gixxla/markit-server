import { CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export default class CommonEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;
}
