import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Tag from "../entities/tag.entity";
import User from "../entities/user.entity";
import BookmarkTag from "../entities/bookmark-tag.entity";
import CreateTagDto from "./dto/create-tag.dto";
import UpdateTagDto from "./dto/update-tag.dto";

@Injectable()
export default class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(BookmarkTag)
    private readonly bookmarkTagRepository: Repository<BookmarkTag>,
  ) {}

  async create(user: User, createTagDto: CreateTagDto): Promise<Tag> {
    const { name } = createTagDto;

    const existingtag = await this.tagRepository.findOne({
      where: { name, userId: Number(user.id) },
    });
    if (existingtag) {
      throw new ConflictException(`이미 [${name}] 태그가 존재합니다.`);
    }

    const newTag = this.tagRepository.create({
      name,
      user,
      userId: Number(user.id),
    });

    return this.tagRepository.save(newTag);
  }

  async findAll(user: User): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { userId: Number(user.id) },
      order: { name: "ASC" },
    });
  }

  async update(userId: string, tagId: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id: String(tagId) },
      relations: ["user"],
    });

    if (!tag) {
      throw new NotFoundException("태그를 찾을 수 없습니다.");
    }

    if (tag.user.id !== userId) {
      throw new ForbiddenException("이 태그를 수정할 권한이 없습니다.");
    }

    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existingConflict = await this.tagRepository.findOne({
        where: { name: updateTagDto.name, userId: Number(userId) },
      });

      if (existingConflict) {
        throw new ConflictException(`이미 [${updateTagDto.name}] 태그가 존재합니다.`);
      }
    }

    await this.tagRepository.update(tagId, updateTagDto);

    return this.tagRepository.findOne({ where: { id: String(tagId) } }) as Promise<Tag>;
  }

  async delete(userId: string, tagId: number): Promise<void> {
    const tag = await this.tagRepository.findOne({
      where: { id: String(tagId) },
      relations: ["user"],
    });

    if (!tag) {
      throw new NotFoundException("태그를 찾을 수 없습니다.");
    }

    if (tag.user.id !== userId) {
      throw new ForbiddenException("이 태그를 삭제할 권한이 없습니다.");
    }

    await this.tagRepository.delete(tagId);
  }
}
