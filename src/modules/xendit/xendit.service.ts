// // src/modules/xendit/xendit.service.ts
// import Xendit from "xendit-node";

// export class XenditService {
//   private invoice;

//   constructor() {
//     const xendit = new Xendit({
//       secretKey: process.env.XENDIT_SECRET_KEY as string,
//     });
//     this.invoice = xendit.Invoice;
//   }

//   async createInvoice(
//     amount: number,
//     customerEmail: string,
//     description: string
//   ) {
//     const invoice = await this.invoice.createInvoice({
//       data: {
//         externalId: `order-${Date.now()}`, // ✅ camelCase
//         amount,
//         payerEmail: customerEmail, // ✅ camelCase
//         description,
//       },
//     });

//     return invoice;
//   }

//   async handleWebhook(event: any) {
//     console.log("Xendit webhook event:", event);

//     if (event.status === "PAID") {
//       console.log(`Order ${event.externalId} is paid.`);
//     }

//     return { message: "Webhook processed" };
//   }
// }

// src/modules/xendit/xendit.service.ts
import Xendit from "xendit-node";

interface InvoiceRecord {
  id: string;
  externalId: string;
  amount: number;
  payerEmail?: string;
  description?: string;
  status: string;
  createdAt: Date;
  expiryDate?: Date;
}

export class XenditService {
  private invoice;
  private memoryStore: Map<string, InvoiceRecord> = new Map();

  constructor() {
    const xendit = new Xendit({
      secretKey: process.env.XENDIT_SECRET_KEY as string,
    });
    this.invoice = xendit.Invoice;
  }

  async createInvoice(
    amount: number,
    customerEmail: string,
    description: string
  ) {
    const invoice = await this.invoice.createInvoice({
      data: {
        externalId: `order-${Date.now()}`,
        amount,
        payerEmail: customerEmail,
        description,
      },
    });

    // save to memory
    const record: InvoiceRecord = {
      id: invoice.id as string,
      externalId: invoice.externalId,
      amount: invoice.amount,
      payerEmail: invoice.payerEmail,
      description: invoice.description ?? "",
      status: invoice.status,
      createdAt: new Date(invoice.created ?? Date.now()),
      expiryDate: invoice.expiryDate ? new Date(invoice.expiryDate) : undefined,
    };

    this.memoryStore.set(invoice.id as string, record);

    return invoice;
  }

  async getInvoice(id: string) {
    const invoice = this.memoryStore.get(id);
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  }

  async expireInvoice(id: string) {
    const invoice = this.memoryStore.get(id);
    if (!invoice) throw new Error("Invoice not found");

    invoice.status = "EXPIRED";
    this.memoryStore.set(id, invoice);
    return invoice;
  }

  async handleWebhook(event: any) {
    console.log("Xendit webhook event:", event);

    const invoice = this.memoryStore.get(event.id);
    if (invoice) {
      invoice.status = event.status;
      this.memoryStore.set(event.id, invoice);
    }

    if (event.status === "PAID") {
      console.log(`Order ${event.externalId} is paid.`);
    }

    return { message: "Webhook processed" };
  }

  async listInvoices() {
    return Array.from(this.memoryStore.values());
  }
}
