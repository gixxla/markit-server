import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../entities/user.entity";
import RegisterDto from "./register.dto";

@Injectable()
class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async registerAnonymous(anonymousId: string): Promise<User> {
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

    await this.userRepository.save(newUser);
    return newUser;
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { anonymousId, email, password } = registerDto;

    const existingEmail = await this.userRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException("이미 사용 중인 이메일입니다.");
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = this.userRepository.create({
      anonymousId,
      email,
      passwordHash,
      isRegistered: true,
      lastActiveAt: new Date(),
    });

    try {
      await this.userRepository.save(newUser);
      // 데이터 마이그레이션
      return newUser;
    } catch (error) {
      // 데이터베이스 오류 처리
      throw new ConflictException("회원가입 중 오류가 발생했습니다.");
    }
  }
}

export default AuthService;
