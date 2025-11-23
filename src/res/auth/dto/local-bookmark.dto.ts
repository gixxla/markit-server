import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class LocalBookmarkDto {
  @IsUrl({}, { message: "URL 형식이 유효하지 않습니다." })
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  categoryName?: string;

  @IsString()
  @IsOptional()
  localId?: string;
}
