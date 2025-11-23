import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { User } from "../entities/user.entity";
import { BookmarkModule } from "../bookmark/bookmark.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), BookmarkModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
