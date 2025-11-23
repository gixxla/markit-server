import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: "카테고리 이름은 20자를 초과할 수 없습니다." })
  name: string;
}
