import { CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export class CommonEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;
}
