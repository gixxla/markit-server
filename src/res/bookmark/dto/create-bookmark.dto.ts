import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateBookmarkDto {
  @IsUrl({}, { message: "URL 형식이 유효하지 않습니다." })
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
