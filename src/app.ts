import "reflect-metadata";
import express, { Express } from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import { PORT } from "./config/env";
import { SampleRouter } from "./modules/sample/sample.router";
import { XenditRouter } from "./modules/xendit/xendit.router";
import { AuthRouter } from "./modules/auth/auth.router";
import { TransactionRouter } from "./modules/transaction/transaction.router";

export class App {
  app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  //fungsi dalam sebuah class disebut method;
  //private hanya bisa di access untuk App
  private configure() {
    this.app.use(cors());
    this.app.use(express.json()); // untuk menerima request body
  }

  //dua method akan dijalankan ketika class dipanggil
  private routes() {
    const sampleRouter = new SampleRouter();
    const xenditRouter = new XenditRouter();
    const authRouter = new AuthRouter();
    const transactionRouter = new TransactionRouter();

    this.app.use("/samples", sampleRouter.getRouter());
    this.app.use("/auth", authRouter.getRouter());
    this.app.use("/transactions", transactionRouter.getRouter());
    this.app.use("/xendit", xenditRouter.getRouter());
  }

  private handleError() {
    this.app.use(errorMiddleware);
  }

  public start() {
    this.app.listen(PORT, () => {
      console.log(`Server running on Port : ${PORT}`);
    });
  }
}
