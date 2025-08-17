import { IsEmail, IsNotEmpty, IsNumber, Min } from "class-validator";

export class CreateInvoiceDto {
  @IsNumber()
  @Min(1000)
  amount!: number;

  @IsEmail()
  customerEmail!: string;

  @IsNotEmpty()
  description!: string;
}
