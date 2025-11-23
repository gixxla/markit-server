import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Category from "../entities/category.entity";
import User from "../entities/user.entity";
import CreateCategoryDto from "./dto/create-category.dto";
import UpdateCategoryDto from "./dto/update-category.dto";

@Injectable()
export default class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(user: User, createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      user,
      userId: Number(user.id),
    });

    return this.categoryRepository.save(category);
  }

  async findAll(user: User): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { userId: Number(user.id) },
      order: { createdAt: "DESC" },
    });
  }

  async update(userId: string, categoryId: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: String(categoryId) },
      relations: ["user"],
    });

    if (!category) {
      throw new NotFoundException("카테고리를 찾을 수 없습니다.");
    }

    if (category.user.id !== userId) {
      throw new ForbiddenException("이 카테고리를 수정할 권한이 없습니다.");
    }

    await this.categoryRepository.update(categoryId, updateCategoryDto);

    return this.categoryRepository.findOne({ where: { id: String(categoryId) } }) as Promise<Category>;
  }

  async delete(userId: string, categoryId: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: String(categoryId) },
      relations: ["user"],
    });

    if (!category) {
      throw new NotFoundException("카테고리를 찾을 수 없습니다.");
    }

    if (category.user.id !== userId) {
      throw new ForbiddenException("이 카테고리를 삭제할 권한이 없습니다.");
    }

    await this.categoryRepository.delete(categoryId);
  }
}
