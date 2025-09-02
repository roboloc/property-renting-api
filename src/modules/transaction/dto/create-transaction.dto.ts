import { Type } from "class-transformer";
import { IsNumber, IsDate } from "class-validator";

export class CreateTransactionDTO {
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  endDate!: Date;

  @Type(() => Number)
  @IsNumber()
  roomId!: number;
}
