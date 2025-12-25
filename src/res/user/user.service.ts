import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../entities/user.entity";
import { RegisterDto } from "./dto/register-user.dto";
import { BookmarkService } from "../bookmark/bookmark.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private bookmarkService: BookmarkService,
  ) {}

  async registerAsGuest(guestId: string): Promise<User> {
    let user = await this.userRepository.findOne({ where: { guestId } });

    if (user) {
      user.lastActiveAt = new Date();
      await this.userRepository.save(user);
      return user;
    }

    user = this.userRepository.create({
      guestId,
      isRegistered: false,
      lastActiveAt: new Date(),
    });

    try {
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw new ConflictException("통신 중 오류가 발생했습니다.");
    }
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { guestId, email, password, localBookmarks } = registerDto;

    const existingEmail = await this.userRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException("이미 사용 중인 이메일입니다.");
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    let user: User;

    if (guestId) {
      const guestUser = await this.userRepository.findOne({ where: { guestId } });

      if (guestUser) {
        user = this.userRepository.create({
          ...guestUser,
          email,
          hashedPassword,
          isRegistered: true,
          lastActiveAt: new Date(),
        });
      } else {
        user = this.userRepository.create({
          guestId,
          email,
          hashedPassword,
          isRegistered: true,
          lastActiveAt: new Date(),
        });
      }
    } else {
      user = this.userRepository.create({
        guestId: null,
        email,
        hashedPassword,
        isRegistered: true,
        lastActiveAt: new Date(),
      });
    }

    try {
      const savedUser = await this.userRepository.save(user);

      if (localBookmarks && localBookmarks.length > 0) {
        const migrationPromises = localBookmarks.map((localBookmark) =>
          this.bookmarkService.migrate(savedUser, localBookmark),
        );
        await Promise.all(migrationPromises);
      }
      return savedUser;
    } catch (error) {
      console.error(error);
      throw new ConflictException("회원가입 중 오류가 발생했습니다.");
    }
  }

  async checkDuplicateEmail(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      throw new ConflictException("이미 가입된 이메일입니다.");
    }
  }

  async findOne(criteria: FindOptionsWhere<User>): Promise<User | null> {
    return this.userRepository.findOne({ where: criteria });
  }

  async create(createUserData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(createUserData);
    return this.userRepository.save(user);
  }

  async update(userId: string, updateData: Partial<User>): Promise<void> {
    await this.userRepository.update(userId, updateData);
  }
}
