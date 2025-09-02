// import { Request, Response, NextFunction } from "express";
// import { plainToInstance } from "class-transformer";
// import { validateOrReject } from "class-validator";
// import { TransactionService } from "./transaction.service";
// import { CreateTransactionDTO } from "./dto/create-transaction.dto";
// import { ApiError } from "../../utils/api-error";
// import { GetTransactionsDTO } from "./dto/get-transaction.dto";

// export class TransactionController {
//   private transactionService: TransactionService;

//   constructor() {
//     this.transactionService = new TransactionService();
//   }

//   getAllTransactions = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       const dto = plainToInstance(GetTransactionsDTO, req.query);
//       const userId = res.locals.user.id;
//       const role = res.locals.user.role;
//       console.log("role from JWT:", userId, role);

//       const [data, total] = await Promise.all([
//         this.transactionService.getAllTransactions(dto, userId, role),
//         this.transactionService.countAllTransactions(dto, userId, role),
//       ]);

//       res.status(200).json({
//         data,
//         meta: {
//           page: dto.page,
//           take: dto.take,
//           total,
//         },
//       });
//     } catch (err) {
//       next(err);
//     }
//   };

//   //   getTransactionsById = async (
//   //     req: Request,
//   //     res: Response,
//   //     next: NextFunction
//   //   ) => {
//   //     try {
//   //       // pada const quey melakukan validasi yang ada pada dto blog dan dto pagination yang melakukan validasi kembali pada sort order dll
//   //       const id = Number(req.params.id);
//   //       const result = await this.transactionService.getTransactionsById(id);
//   //       res.status(200).send(result);
//   //     } catch (error) {
//   //       next(error);
//   //     }
//   //   };

//   createTransaction = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       const dto = plainToInstance(CreateTransactionDTO, req.body);
//       // await validateOrReject(dto);
//       const userId = res.locals.user.id;
//       const result = await this.transactionService.createTransaction(
//         dto,
//         userId
//       );
//       res.status(201).json(result);
//       // res.status(201).json("sucess");
//     } catch (err) {
//       next(err);
//     }
//   };

//   uploadPaymentProof = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       const uuid = req.params.uuid;
//       const userId = res.locals.user.id;
//       const paymentProof = req.file; // get uploaded file from Multer

//       if (!paymentProof) {
//         throw new ApiError("Payment image is required", 400);
//       }

//       const result = await this.transactionService.uploadPaymentProof(
//         uuid,
//         paymentProof,
//         userId
//       );

//       // res.status(200).json("payment proof uploaded successfully");
//       res.status(200).json(result);
//     } catch (err) {
//       next(err);
//     }
//   };

//   approveTransaction = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       const uuid = req.params.uuid;
//       const result = await this.transactionService.approveTransaction(uuid);
//       res.json(result);
//     } catch (err) {
//       next(err);
//     }
//   };

//   rejectTransaction = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       const uuid = req.params.uuid;
//       const result = await this.transactionService.rejectTransaction(uuid);
//       res.json(200).send(result);
//     } catch (err) {
//       next(err);
//     }
//   };
// }
// src/modules/transaction/transaction.controller.ts
import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { TransactionService } from "./transaction.service";
import { CreateTransactionDTO } from "./dto/create-transaction.dto";
import { ApiError } from "../../utils/api-error";
import { GetTransactionsDTO } from "./dto/get-transaction.dto";

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  getAllTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const dto = plainToInstance(GetTransactionsDTO, req.query);
      const userId = res.locals.user.id;
      const role = res.locals.user.role;

      const [data, total] = await Promise.all([
        this.transactionService.getAllTransactions(dto, userId, role),
        this.transactionService.countAllTransactions(dto, userId, role),
      ]);

      res.status(200).json({
        data,
        meta: { page: dto.page, take: dto.take, total },
      });
    } catch (err) {
      next(err);
    }
  };

  getTransactionByUuid = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { uuid } = req.params;

      if (!uuid) {
        throw new ApiError("Transaction UUID is required", 400);
      }

      const transaction = await this.transactionService.getTransactionByUuid(
        uuid
      );

      res.status(200).json({ transaction });
    } catch (err: any) {
      // Pass error to Express error handler
      next(err);
    }
  };

  createTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const dto = plainToInstance(CreateTransactionDTO, req.body);
      await validateOrReject(dto);
      const userId = res.locals.user.id;

      const result = await this.transactionService.createTransaction(
        dto,
        userId
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  uploadPaymentProof = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const uuid = req.params.uuid;
      const userId = res.locals.user.id;
      const paymentProof = req.file;

      if (!paymentProof) throw new ApiError("Payment image is required", 400);

      const result = await this.transactionService.uploadPaymentProof(
        uuid,
        paymentProof,
        userId
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  approveTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const uuid = req.params.uuid;
      const result = await this.transactionService.approveTransaction(uuid);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  rejectTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const uuid = req.params.uuid;
      const result = await this.transactionService.rejectTransaction(uuid);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  // ✅ NEW: Expire transaction manually (admin/tenant only)
  checkoutRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const uuid = req.params.uuid;
      if (!uuid) throw new ApiError("Transaction UUID is required", 400);
      const result = await this.transactionService.checkoutRoom(uuid);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
