import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { User } from "../entities/user.entity";
import UserDeco from "../../decorators/user.decorator";

@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@UserDeco() user: User, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(user, createCategoryDto);
  }

  @Get()
  findAll(@UserDeco() user: User) {
    return this.categoryService.findAll(user);
  }

  @Patch(":id")
  update(@UserDeco() user: User, @Param("id") id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(user.id, id, updateCategoryDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@UserDeco() user: User, @Param("id") id: string) {
    return this.categoryService.delete(user.id, id);
  }
}
