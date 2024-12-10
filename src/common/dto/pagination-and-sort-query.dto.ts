import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { SortOrder } from '../enums/sort-order.enum';
import { SortByEnum } from '../enums/sort-by.enum';

export class PaginationAndSortQueryDto {
  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.ASC;

  @ApiPropertyOptional({
    enum: SortByEnum,
    default: SortByEnum.ID,
  })
  @IsEnum(SortByEnum)
  @IsOptional()
  sortBy?: SortByEnum = SortByEnum.ID;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 30,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  perPage?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.perPage;
  }
}
