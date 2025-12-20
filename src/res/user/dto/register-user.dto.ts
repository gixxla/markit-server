import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MinLength, IsUUID, IsArray, ValidateNested, IsOptional } from "class-validator";
import { LocalBookmarkDto } from "src/res/auth/dto/local-bookmark.dto";

export class RegisterDto {
  @IsOptional()
  @IsUUID()
  anonymousId?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." })
  password: string;

  @IsString()
  @IsNotEmpty()
  verificationCode: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LocalBookmarkDto)
  localBookmarks: LocalBookmarkDto[];
}
