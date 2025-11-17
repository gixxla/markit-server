import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as path from "path";
import * as dotenv from "dotenv";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./res/user/user.module";

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: "postgres",
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT!),
        username: process.env.DB_USERNAME!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
        entities: [path.join(__dirname, "**", "*.entity.{ts,js}")],
        synchronize: false,
        logging: true,
        timezone: "local",
      }),
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
