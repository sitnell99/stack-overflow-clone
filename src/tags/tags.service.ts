import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginationPageDto } from '../common/dto/pagination-page.dto';
import { PaginationOptionsDto } from '../common/dto/pagination-options.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async findOne(name: string): Promise<Tag> {
    return await this.tagsRepository.findOneBy({
      name,
    });
  }

  async getTags(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginationPageDto<Tag>> {
    const [tags, totalItems] = await this.tagsRepository.findAndCount({
      skip: paginationQuery.skip,
      take: paginationQuery.perPage,
    });

    const paginationOptions = new PaginationOptionsDto({
      totalItems,
      paginationQuery,
    });

    return new PaginationPageDto(tags, paginationOptions);
  }

  async upsertAndFind(tags: string[]): Promise<Tag[]> {
    if (tags.length === 0) {
      return [];
    }
    const tagsArray = tags.map((tag) => ({ name: tag }));

    await this.tagsRepository.upsert(tagsArray, ['name']);

    return await this.tagsRepository.find({
      where: tagsArray,
    });
  }

  async remove(name: string): Promise<Tag> {
    const tag = await this.findOne(name);
    if (!tag) {
      throw new NotFoundException(`Tag with name ${name} not found`);
    }
    return this.tagsRepository.remove(tag);
  }
}
