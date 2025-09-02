// transaction.service.ts
import { ApiError } from "../../utils/api-error";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDTO } from "./dto/create-transaction.dto";
import { GetTransactionsDTO } from "./dto/get-transaction.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { Transaction_Status } from "../../generated/prisma/client";
import { TransactionQueue } from "./transaction.queue";

export class TransactionService {
  private prisma: PrismaService;
  private cloudinaryService: CloudinaryService;
  private transactionQueue: TransactionQueue;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
    this.transactionQueue = new TransactionQueue();
  }

  // ✅ Get all transactions
  getAllTransactions = async (
    dto: GetTransactionsDTO,
    userId: number,
    role: string
  ) => {
    const whereClause: any = {};

    if (role === "USER") {
      whereClause.userId = userId;
    } else if (role === "TENANT") {
      // ✅ fixed: tenant is just userId in Properties
      whereClause.room = {
        property: {
          userId: userId,
        },
      };
    }

    if (dto.search) {
      whereClause.OR = [
        { uuid: { contains: dto.search, mode: "insensitive" } },
        { status: { equals: dto.search as Transaction_Status } },
        { user: { firstName: { contains: dto.search, mode: "insensitive" } } },
        { user: { lastName: { contains: dto.search, mode: "insensitive" } } },
        { user: { email: { contains: dto.search, mode: "insensitive" } } },
        { room: { name: { contains: dto.search, mode: "insensitive" } } },
      ];
    }

    return this.prisma.transaction.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        room: {
          include: {
            property: {
              include: {
                propertyFacilities: true,
                rooms: true,
              },
            },
            roomImages: true,
            roomFacilities: true,
            roomRates: true,
          },
        },
      },
      orderBy: {
        [dto.sortBy]: dto.sortOrder,
      },
      take: dto.take,
      skip: (dto.page - 1) * dto.take,
    });
  };
  // ✅ New service: get transactions with pagination + count

  // ✅ Count
  countAllTransactions = async (
    dto: GetTransactionsDTO,
    userId: number,
    role: string
  ) => {
    const whereClause: any = {};

    if (role === "USER") {
      whereClause.userId = userId;
    } else if (role === "TENANT") {
      // ✅ fixed
      whereClause.room = {
        property: { userId: userId },
      };
    }

    if (dto.search) {
      whereClause.OR = [
        { uuid: { contains: dto.search, mode: "insensitive" } },
        { status: { equals: dto.search as Transaction_Status } },
        { user: { firstName: { contains: dto.search, mode: "insensitive" } } },
        { user: { lastName: { contains: dto.search, mode: "insensitive" } } },
        { user: { email: { contains: dto.search, mode: "insensitive" } } },
        { room: { name: { contains: dto.search, mode: "insensitive" } } },
      ];
    }

    return this.prisma.transaction.count({ where: whereClause });
  };

  getTransactionByUuid = async (uuid: string) => {
    const transaction = await this.prisma.transaction.findUnique({
      where: { uuid },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          include: {
            roomImages: true, // ✅ include room images
            property: {
              select: {
                id: true,
                title: true,
                latitute: true,
                longtitude: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new ApiError("Transaction not found", 404);
    }

    return transaction;
  };

  // ✅ Create transaction
  createTransaction = async (dto: CreateTransactionDTO, userId: number) => {
    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
    });
    if (!room) throw new ApiError("room not found", 404);
    if (room.stock < 1) throw new ApiError("No rooms available", 400);

    const total = room.price;

    const newTransaction = await this.prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          userId,
          roomId: dto.roomId,
          total,
          status: Transaction_Status.WAITING_FOR_PAYMENT,
          paymentProof: "",
          startDate: dto.startDate,
          endDate: dto.endDate,
          expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours expiry
        },
      });

      await tx.room.update({
        where: { id: dto.roomId },
        data: { stock: { decrement: 1 } },
      });

      return created;
    });

    return {
      message: "Transaction created successfully",
      transaction: newTransaction,
    };
  };

  // ✅ Upload payment proof
  uploadPaymentProof = async (
    uuid: string,
    file: Express.Multer.File,
    userId: number
  ) => {
    const transaction = await this.prisma.transaction.findUnique({
      where: { uuid },
    });
    if (!transaction) throw new ApiError("Transaction not found", 404);
    if (transaction.userId !== userId) throw new ApiError("Unauthorized", 403);
    if (transaction.status !== Transaction_Status.WAITING_FOR_PAYMENT)
      throw new ApiError("Cannot upload payment for this transaction", 400);

    const { secure_url } = await this.cloudinaryService.upload(file);

    return this.prisma.transaction.update({
      where: { uuid },
      data: {
        paymentProof: secure_url,
        status: Transaction_Status.WAITING_FOR_CONFIRMATION,
        expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // refresh expiredAt
        updatedAt: new Date(),
      },
    });
  };

  // ✅ Approve
  approveTransaction = async (uuid: string) => {
    return this.prisma.transaction.update({
      where: { uuid },
      data: {
        status: Transaction_Status.PAID,
        updatedAt: new Date(),
      },
    });
  };

  // ✅ Reject
  rejectTransaction = async (uuid: string) => {
    const transaction = await this.prisma.transaction.findUnique({
      where: { uuid },
    });
    if (!transaction) throw new ApiError("Transaction not found", 404);

    return this.prisma.$transaction(async (tx) => {
      await tx.room.update({
        where: { id: transaction.roomId },
        data: { stock: { increment: 1 } },
      });

      return tx.transaction.update({
        where: { uuid },
        data: {
          status: Transaction_Status.REJECTED,
          updatedAt: new Date(),
        },
      });
    });
  };

  // ✅ Checkout room  (restore stock)
  checkoutRoom = async (uuid: string) => {
    const transaction = await this.prisma.transaction.findUnique({
      where: { uuid },
    });
    if (!transaction) throw new ApiError("Transaction not found", 404);

    if (
      transaction.status === Transaction_Status.PAID &&
      transaction.endDate < new Date()
    ) {
      return this.prisma.$transaction(async (tx) => {
        await tx.room.update({
          where: { id: transaction.roomId },
          data: { stock: { increment: 1 } },
        });

        return tx.transaction.update({
          where: { uuid },
          data: { status: Transaction_Status.EXPIRED },
        });
      });
    }

    // merubah status menjadi expired
    return { message: "Transaction not expired yet" };
  };
}
