import { Module } from '@nestjs/common';
import { CrisisController } from './crisis.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({ controllers: [CrisisController], providers: [PrismaService] })
export class CrisisModule {}