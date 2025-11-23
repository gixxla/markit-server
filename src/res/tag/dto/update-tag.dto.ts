import { PartialType } from "@nestjs/mapped-types";
import CreateTagDto from "./create-tag.dto";

export default class UpdateTagDto extends PartialType(CreateTagDto) {}
