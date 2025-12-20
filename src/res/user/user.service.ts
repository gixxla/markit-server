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

  async registerByAnonymous(anonymousId: string): Promise<User> {
    let newUser = await this.userRepository.findOne({ where: { anonymousId } });

    if (newUser) {
      newUser.lastActiveAt = new Date();
      await this.userRepository.save(newUser);
      return newUser;
    }

    newUser = this.userRepository.create({
      anonymousId,
      isRegistered: false,
      lastActiveAt: new Date(),
    });

    try {
      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      throw new ConflictException("통신 중 오류가 발생했습니다.");
    }
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { anonymousId, email, password, localBookmarks } = registerDto;

    const existingEmail = await this.userRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException("이미 사용 중인 이메일입니다.");
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    let user: User;

    if (anonymousId) {
      const anonymousUser = await this.userRepository.findOne({ where: { anonymousId } });

      if (anonymousUser) {
        user = this.userRepository.create({
          ...anonymousUser,
          email,
          hashedPassword,
          isRegistered: true,
          lastActiveAt: new Date(),
        });
      } else {
        user = this.userRepository.create({
          anonymousId,
          email,
          hashedPassword,
          isRegistered: true,
          lastActiveAt: new Date(),
        });
      }
    } else {
      user = this.userRepository.create({
        anonymousId: null,
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
