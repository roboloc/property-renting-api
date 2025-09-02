// import { Queue } from "bullmq";
// import { connection } from "../../config/redis"; // Adjust the import path as necessary

// export class TransactionQueue {
//   private queue: Queue;

//   constructor() {
//     this.queue = new Queue("transactionQueue", { connection });
//   }

//   addNewTransactionJob = async (payload: { id: number }) => {
//     return await this.queue.add("expireTransaction", payload, {
//       jobId: `transaction-${payload.id}`,
//       delay: 15 * 60 * 1000, // 15 minutes (change to 2h in prod)
//       attempts: 1,
//       backoff: {
//         type: "exponential",
//         delay: 1000,
//       },
//       removeOnComplete: true,
//       removeOnFail: true,
//     });
//   };
// }

import { Queue } from "bullmq";
import { connection } from "../../config/redis";

export class TransactionQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("transactionQueue", { connection });
  }

  addNewTransactionJob = async (payload: { id: number }) => {
    return await this.queue.add("expireTransaction", payload, {
      jobId: `transaction-${payload.id}`,
      delay: 2 * 60 * 60 * 1000, // ⏰ 2 hours to match expiredAt in schema
      attempts: 1,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: true,
    });
  };
}
