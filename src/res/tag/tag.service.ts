import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tag } from "../entities/tag.entity";
import { User } from "../entities/user.entity";
import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
import { verifyAuthorization } from "src/common/helpers/authorization.helper";

const TAG_COLORS = [
  "#9CA3AF", // Cool Grey
  "#8E5252", // Muted Marsala
  "#9A634E", // Burnt Sienna
  "#947C49", // Antique Gold
  "#556B52", // Olive Drab
  "#456B68", // Deep Sea
  "#4A6075", // Slate Blue
  "#565372", // Dusty Indigo
  "#705263", // Old Plum
  "#6B5B52", // Walnut
  "#4B5563", // Gray Blue
  "#323232", // Soft Black
];

function getRandomColor(): string {
  const randomIndex = Math.floor(Math.random() * TAG_COLORS.length);
  return TAG_COLORS[randomIndex];
}

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(user: User, createTagDto: CreateTagDto): Promise<Tag> {
    const { name, colorCode } = createTagDto;

    const existingtag = await this.tagRepository.findOne({
      where: { name, userId: user.id },
    });
    if (existingtag) {
      throw new ConflictException(`이미 [${name}] 태그가 존재합니다.`);
    }

    const newTag = this.tagRepository.create({
      name,
      colorCode: colorCode || getRandomColor(),
      userId: user.id,
    });

    return this.tagRepository.save(newTag);
  }

  async findAll(user: User): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { userId: user.id },
      order: { name: "ASC" },
    });
  }

  async update(userId: string, tagId: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await verifyAuthorization(this.tagRepository, tagId, userId, "태그");

    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existingConflict = await this.tagRepository.findOne({
        where: { name: updateTagDto.name, userId },
      });

      if (existingConflict) {
        throw new ConflictException(`이미 [${updateTagDto.name}] 태그가 존재합니다.`);
      }
    }

    await this.tagRepository.update(tagId, updateTagDto);

    return this.tagRepository.findOne({ where: { id: tagId } }) as Promise<Tag>;
  }

  async delete(userId: string, tagId: string): Promise<void> {
    await verifyAuthorization(this.tagRepository, tagId, userId, "태그");

    await this.tagRepository.delete(tagId);
  }

  async findOrCreateByName(userId: string, tagName: string): Promise<Tag> {
    let tag = await this.tagRepository.findOne({
      where: { name: tagName, userId },
    });

    if (!tag) {
      tag = this.tagRepository.create({
        name: tagName,
        userId,
        colorCode: getRandomColor(),
      });
      tag = await this.tagRepository.save(tag);
    }

    return tag;
  }
}
