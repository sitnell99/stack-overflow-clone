import { ApiProperty } from '@nestjs/swagger';
import { PaginationOptions } from '../interfaces/pagination-options.interface';

export class PaginationOptionsDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  perPage: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  pageCount: number;

  @ApiProperty()
  hasPreviousPage: boolean;

  @ApiProperty()
  hasNextPage: boolean;

  constructor({ paginationQuery, totalItems }: PaginationOptions) {
    this.page = paginationQuery.page;
    this.perPage = paginationQuery.perPage;
    this.totalItems = totalItems;
    this.pageCount = Math.ceil(this.totalItems / this.perPage);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
