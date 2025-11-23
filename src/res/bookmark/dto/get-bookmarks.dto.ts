import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetBookmarksDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
