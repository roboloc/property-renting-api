// import { Router } from "express";
// import { TransactionController } from "./transaction.controller";
// import { JwtMiddleware } from "../../middlewares/jwt.middleware";
// import { JWT_SECRET } from "../../config/env";
// import multer from "multer";
// import { AuthTenant } from "../../middlewares/tenant.middleware";
// export class TransactionRouter {
//   public router: Router;
//   private transactionController: TransactionController;
//   private jwtMiddleware: JwtMiddleware;

//   constructor() {
//     this.router = Router();
//     this.transactionController = new TransactionController();
//     this.jwtMiddleware = new JwtMiddleware();

//     this.initializeRoutes();
//   }

//   private initializeRoutes = () => {
//     const verify = this.jwtMiddleware.verifyToken(JWT_SECRET!);
//     const upload = multer({ storage: multer.memoryStorage() }); // In-memory for Cloudinary or buffer-based upload

//     this.router.get(
//       "/",
//       this.jwtMiddleware.verifyToken(JWT_SECRET!),
//       this.transactionController.getAllTransactions
//     );

//     // this.router.get(
//     //   "/:id",
//     //   this.jwtMiddleware.verifyToken(JWT_SECRET!),
//     //   this.transactionController.getTransactionsById
//     // );

//     this.router.post("/", verify, this.transactionController.createTransaction);

//     this.router.patch(
//       "/upload/:uuid",
//       verify,
//       upload.single("paymentProof"),
//       this.transactionController.uploadPaymentProof
//     );

//     this.router.patch(
//       "/approve/:uuid",
//       verify,
//       AuthTenant,
//       this.transactionController.approveTransaction
//     );

//     this.router.patch(
//       "/reject/:uuid",
//       verify,
//       AuthTenant,
//       this.transactionController.rejectTransaction
//     );
//   };

//   getRouter = () => {
//     return this.router;
//   };
// }

// src/modules/transaction/transaction.router.ts
import { Router } from "express";
import { TransactionController } from "./transaction.controller";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { JWT_SECRET } from "../../config/env";
import multer from "multer";
import { AuthTenant } from "../../middlewares/tenant.middleware";

export class TransactionRouter {
  public router: Router;
  private transactionController: TransactionController;
  private jwtMiddleware: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.transactionController = new TransactionController();
    this.jwtMiddleware = new JwtMiddleware();

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    const verify = this.jwtMiddleware.verifyToken(JWT_SECRET!);
    const upload = multer({ storage: multer.memoryStorage() });

    this.router.get("/", verify, this.transactionController.getAllTransactions);

    this.router.get(
      "/:uuid",
      verify,
      this.transactionController.getTransactionByUuid
    );

    this.router.post("/", verify, this.transactionController.createTransaction);

    this.router.patch(
      "/upload/:uuid",
      verify,
      upload.single("paymentProof"),
      this.transactionController.uploadPaymentProof
    );

    this.router.patch(
      "/approve/:uuid",
      verify,
      AuthTenant,
      this.transactionController.approveTransaction
    );

    this.router.patch(
      "/reject/:uuid",
      verify,
      AuthTenant,
      this.transactionController.rejectTransaction
    );

    // ✅ NEW: expire transaction manually
    this.router.patch(
      "/checkout/:uuid",
      verify,
      AuthTenant,
      this.transactionController.checkoutRoom
    );
  };

  getRouter = () => this.router;
}
