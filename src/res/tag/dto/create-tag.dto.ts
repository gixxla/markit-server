import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: "태그 이름은 20자를 초과할 수 없습니다." })
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: "colorCode는 올바른 Hex Color 형식(#RRGGBB)이어야 합니다.",
  })
  colorCode?: string;
}
