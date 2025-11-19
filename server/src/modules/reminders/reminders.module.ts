import { Module } from '@nestjs/common';
import { RemindersController } from './reminders.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({ controllers: [RemindersController], providers: [PrismaService] })
export class RemindersModule {}