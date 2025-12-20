import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { Public } from "src/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Req() req) {
    const user = req?.user;

    return this.authService.getAccessToken(user);
  }

  @Public()
  @Post("send-code")
  async sendVerificationCode(@Body("email") email: string) {
    await this.authService.sendVerificationCode(email);
    return { message: "인증 코드가 발송되었습니다." };
  }

  @UseGuards(JwtAuthGuard)
  @Post("refresh")
  async refresh(@Req() req) {
    return this.authService.getAccessToken(req.user);
  }
}
