import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export default class CreateBookmarkDto {
  @IsUrl({}, { message: "URL 형식이 유효하지 않습니다." })
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
