import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { LocalBookmarkDto } from "./local-bookmark.dto";

export class MigrateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocalBookmarkDto)
  bookmarks: LocalBookmarkDto[];
}
