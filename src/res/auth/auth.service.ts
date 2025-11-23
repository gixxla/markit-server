import { BadRequestException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { User } from "../entities/user.entity";
import { BookmarkService } from "../bookmark/bookmark.service";
import { MigrateDto } from "./dto/migrate.dto";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private bookmarkService: BookmarkService,
  ) {}

  async validateUser(email: string, password: string): Promise<Partial<User>> {
    const user = await this.userService.findOne({ email });
    if (!user) {
      throw new BadRequestException("잘못된 이메일입니다.");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.hashedPassword!);
    if (!isPasswordMatch) {
      throw new BadRequestException("비밀번호가 일치하지 않습니다.");
    }

    await this.userService.update(user.id, { lastActiveAt: new Date() });

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
    };
  }

  async getAccessToken(user: Partial<User>) {
    const payload = { email: user.email, sub: user.id };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async migrateData(user: User, migrateDto: MigrateDto): Promise<void> {
    const { bookmarks } = migrateDto;

    if (bookmarks.length === 0) {
      return;
    }

    const migrationPromises = bookmarks.map((localBookmark) => this.bookmarkService.migrate(user, localBookmark));
    await Promise.all(migrationPromises);
  }
}
