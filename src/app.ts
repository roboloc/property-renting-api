import express, { Express } from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import { PORT } from "./config/env";
import { SampleRouter } from "./modules/sample/sample.router";

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

    this.app.use("/samples", sampleRouter.getRouter());
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
