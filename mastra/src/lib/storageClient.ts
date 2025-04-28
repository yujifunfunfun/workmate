import { PrismaClient } from "@prisma/client";

// グローバル型を拡張して、prismaプロパティを追加
declare global {
  var prisma: PrismaClient | undefined;
}

// グローバルに単一のPrismaClientインスタンスを保持
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // 開発環境では同じPrismaClientインスタンスを再利用（Hot Reload対策）
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export const storageClient = prisma;
