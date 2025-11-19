import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContentModule } from './content/content.module';
import { LogsModule } from './logs/logs.module';
import { CrisisModule } from './crisis/crisis.module';
import { ReportsModule } from './reports/reports.module';
import { RemindersModule } from './reminders/reminders.module';
import { ChatModule } from './chat/chat.module';

@Module({
imports: [AuthModule, UsersModule, ContentModule, LogsModule, CrisisModule, ReportsModule, RemindersModule, ChatModule],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class AppModule {}
