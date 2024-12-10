import { PaginationAndSortQueryDto } from '../dto/pagination-and-sort-query.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

export interface PaginationOptions {
  paginationQuery: PaginationAndSortQueryDto | PaginationQueryDto;
  totalItems: number;
}
