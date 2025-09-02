// import { Worker } from "bullmq";
// import { connection } from "../../config/redis";
// import { PrismaService } from "../prisma/prisma.service";
// import { ApiError } from "../../utils/api-error";

// export class TransactionWorker {
//   worker: Worker;
//   prisma: PrismaService;

//   constructor() {
//     this.prisma = new PrismaService();

//     this.worker = new Worker(
//       "transactionQueue",
//       async (job) => {
//         const id: number = job.data.id;

//         const transaction = await this.prisma.transaction.findUnique({
//           where: { id },
//         });

//         if (!transaction) {
//           throw new ApiError("Invalid transaction ID", 400);
//         }

//         if (transaction.status === "WAITING_FOR_PAYMENT") {
//           await this.prisma.$transaction(async (tx) => {
//             // 1. Mark transaction as expired
//             await tx.transaction.update({
//               where: { id },
//               data: { status: "EXPIRED" },
//             });

//             // 2. Restore stock by 1 (since one transaction = one room)
//             await tx.room.update({
//               where: { id: transaction.roomId },
//               data: {
//                 stock: { increment: 1 },
//               },
//             });
//           });
//         }
//       },
//       { connection }
//     );
//   }
// }

import { Worker } from "bullmq";
import { connection } from "../../config/redis";
import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error";
import { Transaction_Status } from "../../generated/prisma/client";

export class TransactionWorker {
  worker: Worker;
  prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();

    this.worker = new Worker(
      "transactionQueue",
      async (job) => {
        const id: number = job.data.id;

        const transaction = await this.prisma.transaction.findUnique({
          where: { id },
        });

        if (!transaction) {
          throw new ApiError("Invalid transaction ID", 400);
        }

        // Only expire if still waiting for payment
        if (transaction.status === Transaction_Status.WAITING_FOR_PAYMENT) {
          await this.prisma.$transaction(async (tx) => {
            // 1. Mark as expired
            await tx.transaction.update({
              where: { id },
              data: { status: Transaction_Status.EXPIRED },
            });

            // 2. Restore stock
            await tx.room.update({
              where: { id: transaction.roomId },
              data: { stock: { increment: 1 } },
            });
          });
        }
      },
      { connection }
    );
  }
}
