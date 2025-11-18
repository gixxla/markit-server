import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import UserService from "src/res/user/user.service";

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_SECRET_KEY")!,
    });
  }

  async validate(payload) {
    const user = await this.userService.findOne({ id: payload.sub });

    if (!user) {
      throw new UnauthorizedException("접근 권한이 없습니다.");
    }

    return { id: user.id, email: user.email };
  }
}
