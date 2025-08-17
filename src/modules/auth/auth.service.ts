import { JWT_SECRET } from "../../config/env";
import { User } from "../../generated/prisma";

import { ApiError } from "../../utils/api-error";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDTO } from "./dto/register.dto";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";

export class AuthService {
  private prisma: PrismaService;
  private passwordService: PasswordService;
  private tokenService: TokenService;
  private mailService: MailService;

  constructor() {
    this.prisma = new PrismaService();
    this.passwordService = new PasswordService();
    this.tokenService = new TokenService();
    this.mailService = new MailService();
  }

  login = async (
    body: Pick<
      User,
      "email" | "firstName" | "lastName" | "password" | "role" | "provider"
    >
  ) => {
    // cek dulu emailnya ada ga di database
    // kalau ga ada throw error
    // kalau ada cek passwordnya valid atau tidak
    // kalau tidak valid throw error
    // kalau valid generate access token menggunakan jwt
    // return data user beserta tokennya

    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (!user) {
      throw new ApiError("email not found", 404);
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      body.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new ApiError("invalid password", 404);
    }

    const accessToken = this.tokenService.generateToken(
      {
        id: user.id,
      },
      JWT_SECRET!
    );

    const { password, ...userWithoutPassword } = user;

    return { ...userWithoutPassword, accessToken };
  };

  register = async (body: RegisterDTO) => {
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (existingEmail) {
      throw new ApiError("email already exist", 400);
    }

    const hashPassword = await this.passwordService.hashPassword(body.password);

    const newUser = await this.prisma.user.create({
      data: { ...body, password: hashPassword },
      omit: { password: true },
    });

    await this.mailService.sendEmail(
      body.email,
      "Welcome to My BlogHub",
      //diperhatikan nama template dari mail
      "welcome",
      { name: body.lastName }
    );

    return newUser;
    // return { message: "user successfully created" };
  };
}
