import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

// 使用 require 动态导入
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  PrismaClient,
} = require('/home/liyong/gbb/server/baby-photo-backend/generated/prisma');

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
