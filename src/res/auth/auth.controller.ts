import { Controller, Post, Req, UseGuards } from "@nestjs/common";
import { Public } from "src/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";

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
}
