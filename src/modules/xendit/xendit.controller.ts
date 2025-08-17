// // src/modules/xendit/xendit.controller.ts
// import { RequestHandler } from "express";
// import { validate } from "class-validator";
// import { plainToInstance } from "class-transformer";
// import { CreateInvoiceDto } from "./dto/create.invoice.dto";
// import { XenditService } from "./xendit.service";

// export class XenditController {
//   private service: XenditService;

//   constructor() {
//     this.service = new XenditService();
//   }

//   createInvoice: RequestHandler = async (req, res) => {
//     const dto = plainToInstance(CreateInvoiceDto, req.body);
//     const errors = await validate(dto);

//     if (errors.length > 0) {
//       res.status(400).json(errors);
//       return;
//     }

//     try {
//       const invoice = await this.service.createInvoice(
//         dto.amount,
//         dto.customerEmail,
//         dto.description
//       );
//       res.json(invoice);
//     } catch (err: any) {
//       res.status(500).json({ error: err.message });
//     }
//   };

//   webhook: RequestHandler = async (req, res) => {
//     try {
//       const result = await this.service.handleWebhook(req.body);
//       res.json(result);
//     } catch (err: any) {
//       res.status(500).json({ error: err.message });
//     }
//   };
// }

// src/modules/xendit/xendit.controller.ts
import { RequestHandler } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateInvoiceDto } from "./dto/create.invoice.dto";
import { XenditService } from "./xendit.service";

export class XenditController {
  private service: XenditService;

  constructor() {
    this.service = new XenditService();
  }

  // ✅ Create invoice
  createInvoice: RequestHandler = async (req, res) => {
    const dto = plainToInstance(CreateInvoiceDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      res.status(400).json(errors);
      return;
    }

    try {
      const invoice = await this.service.createInvoice(
        dto.amount,
        dto.customerEmail,
        dto.description
      );
      res.json(invoice);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  // ✅ Webhook (when Xendit calls back)
  webhook: RequestHandler = async (req, res) => {
    try {
      const result = await this.service.handleWebhook(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  // ✅ Get invoice by ID
  getInvoice: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await this.service.getInvoice(id);
      res.json(invoice);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  // ✅ Expire invoice by ID
  expireInvoice: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await this.service.expireInvoice(id);
      res.json(invoice);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}
