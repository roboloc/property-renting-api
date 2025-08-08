import { PrismaClient } from "../../generated/prisma";

export class PrismaService extends PrismaClient {
  constructor() {
    super();
    //super digunakan untuk mengeksekusi parent class
  }
}
