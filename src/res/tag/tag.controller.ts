import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { TagService } from "./tag.service";
import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
import { User } from "../entities/user.entity";
import UserDeco from "../../decorators/user.decorator";

@Controller("tag")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@UserDeco() user: User, @Body() createTagDto: CreateTagDto) {
    return this.tagService.create(user, createTagDto);
  }

  @Get()
  findAll(@UserDeco() user: User) {
    return this.tagService.findAll(user);
  }

  @Patch(":id")
  update(@UserDeco() user: User, @Param("id") id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(user.id, id, updateTagDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@UserDeco() user: User, @Param("id") id: string) {
    return this.tagService.delete(user.id, id);
  }
}
