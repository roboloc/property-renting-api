import { IsUUID } from "class-validator";

export class GetTransactionByUUIDDTO {
  @IsUUID()
  uuid!: string;
}
