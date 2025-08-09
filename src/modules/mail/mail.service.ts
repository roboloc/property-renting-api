import { createTransport, Transporter } from "nodemailer";
import { MAIL_PASSWORD, MAIL_USER } from "../../config/env";
import path from "path";
import fs from "fs/promises";
import handlebars, { template } from "handlebars";

export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      service: "gmail",
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD,
      },
    });
  }

  private renderTemplate = async (templateName: string, context: object) => {
    const templateDir = path.resolve(__dirname, "./template");

    const templatePath = path.join(templateDir, `${templateName}.hbs`);

    const templateSource = await fs.readFile(templatePath, "utf-8");

    const compiledTemplate = handlebars.compile(templateSource);

    return compiledTemplate(context);
  };

  sendEmail = async (
    to: string,
    subject: string,
    templateName: string,
    context: object
  ) => {
    const html = await this.renderTemplate(templateName, context);

    await this.transporter.sendMail({
      to,
      subject,
      html: html,
      // html
      // html: "<h1>Selamat bergabung di Website kami!</h1>",
    });
  };
}
