// import { Router } from "express";
// import { XenditController } from "./xendit.controller";

// export class XenditRouter {
//   private router: Router;
//   private xenditController: XenditController;

//   constructor() {
//     this.router = Router();
//     this.xenditController = new XenditController();
//     this.initializeRoutes();
//   }

//   private initializeRoutes = () => {
//     this.router.post("/create-invoice", this.xenditController.createInvoice);

//     this.router.post("/webhook", this.xenditController.webhook);
//   };

//   public getRouter = () => {
//     return this.router;
//   };
// }

// src/modules/xendit/xendit.router.ts
import { Router } from "express";
import { XenditController } from "./xendit.controller";

export class XenditRouter {
  private router: Router;
  private xenditController: XenditController;

  constructor() {
    this.router = Router();
    this.xenditController = new XenditController();
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    // ✅ Create new invoice
    this.router.post("/create-invoice", this.xenditController.createInvoice);

    // ✅ Webhook endpoint (Xendit callback)
    this.router.post("/webhook", this.xenditController.webhook);

    // ✅ Get invoice by ID
    this.router.get("/invoice/:id", this.xenditController.getInvoice);

    // ✅ Expire invoice by ID
    this.router.post(
      "/invoice/:id/expire",
      this.xenditController.expireInvoice
    );
  };

  public getRouter = () => {
    return this.router;
  };
}
