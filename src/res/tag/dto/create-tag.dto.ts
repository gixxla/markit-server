import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export default class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: "태그 이름은 20자를 초과할 수 없습니다." })
  name: string;
}
