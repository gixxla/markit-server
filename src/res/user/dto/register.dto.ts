import { IsEmail, IsNotEmpty, IsString, MinLength, IsUUID } from "class-validator";

export default class RegisterDto {
  @IsUUID()
  @IsNotEmpty()
  anonymousId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." })
  password: string;
}
