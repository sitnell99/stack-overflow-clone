import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationOptionsDto } from './pagination-options.dto';

export class PaginationPageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ type: () => PaginationOptionsDto })
  pagination: PaginationOptionsDto;

  constructor(data: T[], pagination: PaginationOptionsDto) {
    this.data = data;
    this.pagination = pagination;
  }
}
