import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import AuthController from "./auth.controller";
import AuthService from "./auth.service";
import User from "../entities/user.entity";
import UserModule from "../user/user.module";
import LocalStrategy from "./strategies/local.strategy";
import JwtStrategy from "./strategies/jwt.strategy";
import JwtAuthGuard from "./guards/jwt-auth.guard";

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get("JWT_SECRET_KEY"),
          signOptions: { expiresIn: "30m" },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export default class AuthModule {}
