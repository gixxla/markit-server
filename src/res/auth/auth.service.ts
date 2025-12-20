import { BadRequestException, Injectable, Inject, forwardRef } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { EmailService } from "./email.service";
import { User } from "../entities/user.entity";
import { BookmarkService } from "../bookmark/bookmark.service";
import { MigrateDto } from "./dto/migrate.dto";

@Injectable()
export class AuthService {
  private verificationCodes = new Map<string, string>();

  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
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

  async sendVerificationCode(email: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    this.verificationCodes.set(email, code);
    console.log(`[인증 코드 발급] ${email} : ${code}`);

    setTimeout(
      () => {
        if (this.verificationCodes.get(email) === code) {
          this.verificationCodes.delete(email);
          console.log(`[인증 코드 만료] ${email}`);
        }
      },
      5 * 60 * 1000,
    );

    await this.emailService.sendVerificationCode(email, code);
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    const savedCode = this.verificationCodes.get(email);

    if (!savedCode) {
      throw new BadRequestException("인증 코드가 만료되었거나 존재하지 않습니다.");
    }

    if (savedCode !== code) {
      throw new BadRequestException("인증 코드가 일치하지 않습니다.");
    }

    this.verificationCodes.delete(email);
    return true;
  }
}
