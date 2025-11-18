import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import User from "../entities/user.entity";
import RegisterDto from "./register.dto";

@Injectable()
export default class AuthService {
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

    try {
      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      throw new ConflictException("통신 중 오류가 발생했습니다.");
    }
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { anonymousId, email, password } = registerDto;

    const existingEmail = await this.userRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException("이미 사용 중인 이메일입니다.");
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Repository.save가 update로 동작하는 기준은 PK이므로, 해당 회원의 PK를 검색한다.
    const user = await this.userRepository.findOne({ where: { anonymousId } });

    const newUser = this.userRepository.create({
      id: user?.id,
      anonymousId,
      email,
      hashedPassword,
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
