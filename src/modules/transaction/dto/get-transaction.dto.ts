import { PaginationQueryParams } from "../../pagination/dto/pagination.dto";
import { IsOptional, IsString } from "class-validator";

export class GetTransactionsDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  search?: string;
}
