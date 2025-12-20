import { Controller, Post, Body, HttpException, HttpStatus, HttpCode, Inject, forwardRef } from "@nestjs/common";
import { Public } from "src/decorators/public.decorator";
import { UserService } from "./user.service";
import { RegisterDto } from "./dto/register-user.dto";
import { AuthService } from "../auth/auth.service";

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post("anonymous")
  async registerAnonymous(@Body() registrationData: { anonymousId: string }) {
    if (!registrationData.anonymousId) {
      throw new HttpException("Anonymous ID is required", HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.registerByAnonymous(registrationData.anonymousId);

    return {
      id: user.id,
      anonymousId: user.anonymousId,
      isRegistered: user.isRegistered,
      createdAt: user.createdAt,
    };
  }

  @Public()
  @Post("check-email")
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Body("email") email: string) {
    await this.userService.checkDuplicateEmail(email);
    return { isAvailable: true };
  }

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.verifyCode(registerDto.email, registerDto.verificationCode);
    const user = await this.userService.register(registerDto);
    const { accessToken } = await this.authService.getAccessToken(user);

    return {
      id: user.id,
      email: user.email,
      isRegistered: user.isRegistered,
      createdAt: user.createdAt,
      accessToken,
    };
  }
}
