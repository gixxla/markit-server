import { Controller, Post, Body, HttpException, HttpStatus, HttpCode } from "@nestjs/common";
import { Public } from "src/decorators/public.decorator";
import UserService from "./user.service";
import RegisterDto from "./dto/register.dto";

@Controller("user")
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post("anonymous")
  async registerAnonymous(@Body() registrationData: { anonymousId: string }) {
    if (!registrationData.anonymousId) {
      throw new HttpException("Anonymous ID is required", HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.registerAnonymous(registrationData.anonymousId);

    // 테스트 용도, 추후에 변경 (굳이 리턴할 필요 없음)
    return {
      id: user.id,
      anonymousId: user.anonymousId,
      isRegistered: user.isRegistered,
      createdAt: user.createdAt,
    };
  }

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.userService.register(registerDto);

    // 테스트 용도, 추후에 변경 (굳이 리턴할 필요 없음)
    return {
      id: user.id,
      email: user.email,
      isRegistered: user.isRegistered,
      createdAt: user.createdAt,
    };
  }
}
