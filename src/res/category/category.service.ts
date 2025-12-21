import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { verifyAuthorization } from "src/common/helpers/authorization.helper";
import { Category } from "../entities/category.entity";
import { User } from "../entities/user.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(user: User, createCategoryDto: CreateCategoryDto): Promise<Category> {
    const newcategory = this.categoryRepository.create({
      ...createCategoryDto,
      userId: user.id,
    });

    return this.categoryRepository.save(newcategory);
  }

  async findAll(user: User): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { userId: user.id },
      order: { createdAt: "DESC" },
    });
  }

  async update(userId: string, categoryId: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    await verifyAuthorization(this.categoryRepository, categoryId, userId, "카테고리");

    await this.categoryRepository.update(categoryId, updateCategoryDto);

    return this.categoryRepository.findOne({ where: { id: categoryId } }) as Promise<Category>;
  }

  async delete(userId: string, categoryId: string): Promise<void> {
    await verifyAuthorization(this.categoryRepository, categoryId, userId, "카테고리");

    await this.categoryRepository.delete(categoryId);
  }

  async validate(userId: string, categoryId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, userId },
    });

    if (!category) {
      throw new NotFoundException(`ID가 ${categoryId}인 카테고리를 찾을 수 없습니다.`);
    }

    return category;
  }

  async findOrCreateByName(userId: string, categoryName: string): Promise<Category> {
    let category = await this.categoryRepository.findOne({
      where: { name: categoryName, userId },
    });

    if (!category) {
      category = this.categoryRepository.create({
        name: categoryName,
        userId,
      });
      category = await this.categoryRepository.save(category);
    }

    return category;
  }
}
