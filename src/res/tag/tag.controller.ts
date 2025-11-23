import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import TagService from "./tag.service";
import CreateTagDto from "./dto/create-tag.dto";
import UpdateTagDto from "./dto/update-tag.dto";
import UserDeco from "../../decorators/user.decorator";
import User from "../entities/user.entity";

@Controller("tag")
export default class TagController {
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
  update(@UserDeco() user: User, @Param("id", ParseIntPipe) id: number, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(user.id, id, updateTagDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@UserDeco() user: User, @Param("id", ParseIntPipe) id: number) {
    return this.tagService.delete(user.id, id);
  }
}
