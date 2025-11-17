import * as path from "path";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config();

export const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  entities: [path.join(__dirname, "**", "*.entity.{ts,js}")],
  synchronize: false,
  logging: true,
});
