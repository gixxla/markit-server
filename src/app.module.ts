import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as path from "path";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import UserModule from "./res/user/user.module";
import AuthModule from "./res/auth/auth.module";
import BookmarkModule from "./res/bookmark/bookmark.module";
import CategoryModule from "./res/category/category.module";
import TagModule from "./res/tag/tag.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        retryAttempts: configService.get("NODE_ENV") === "prod" ? 10 : 1,
        type: "postgres",
        host: configService.get("DB_HOST"),
        port: Number(configService.get("DB_PORT")),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_NAME"),
        entities: [path.join(__dirname, "**", "*.entity.{ts,js}")],
        synchronize: false,
        logging: true,
        timezone: "local",
      }),
    }),
    UserModule,
    AuthModule,
    BookmarkModule,
    CategoryModule,
    TagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export default class AppModule {}
