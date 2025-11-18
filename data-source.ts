import * as path from "path";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config({ path: `.env.dev` });

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  entities: [path.join(process.cwd(), "src", "res", "entities", "**", "*.entity.ts")],
  migrations: [path.join(process.cwd(), "src", "migrations", "*.ts")],

  synchronize: false,
  logging: true,
});
