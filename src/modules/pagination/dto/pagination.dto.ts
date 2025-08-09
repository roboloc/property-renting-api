import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class PaginationQueryParams {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  //digunakan untuk merubah url yang sebelumnya string dengan tanda tanya localhost:8000?take=5
  // yang sebelumnya string menjadi number
  take: number = 5;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page: number = 1;

  @IsOptional()
  @IsString()
  sortBy: string = "createdAt";

  @IsOptional()
  @IsString()
  sortOrder: string = "desc";
}
