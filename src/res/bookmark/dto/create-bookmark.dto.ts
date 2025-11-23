import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export default class CreateBookmarkDto {
  @IsUrl({}, { message: "URL 형식이 유효하지 않습니다." })
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
