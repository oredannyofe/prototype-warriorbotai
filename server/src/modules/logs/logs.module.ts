import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({ controllers: [LogsController], providers: [PrismaService] })
export class LogsModule {}