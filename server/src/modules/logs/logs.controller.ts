import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('logs')
export class LogsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  create(@Body() body: { userId: number; pain: number; mood?: string; sleep?: string; hydrationCups?: number; medsTaken?: boolean; triggers?: string[]; notes?: string }) {
    return this.prisma.dailyLog.create({ data: { userId: body.userId, pain: body.pain, mood: body.mood, sleep: body.sleep, hydrationCups: body.hydrationCups ?? 0, medsTaken: !!body.medsTaken, triggers: body.triggers ?? [], notes: body.notes ?? null } });
  }

  @Get(':userId')
  list(
    @Param('userId') userId: string,
    @Query('limit') limit = '30',
    @Query('offset') offset = '0',
  ) {
    const take = Math.max(1, Math.min(100, Number(limit)));
    const skip = Math.max(0, Number(offset));
    return this.prisma.dailyLog.findMany({ where: { userId: Number(userId) }, orderBy: { createdAt: 'desc' }, take, skip });
  }

  // Cursor-based pagination using id desc (avoids deep offsets)
  @Get(':userId/cursor')
  async cursorList(
    @Param('userId') userId: string,
    @Query('limit') limit = '30',
    @Query('cursorId') cursorId?: string,
  ) {
    const take = Math.max(1, Math.min(100, Number(limit)));
    const where = { userId: Number(userId) } as const;
    const orderBy = { id: 'desc' } as const;
    let items;
    if (cursorId) {
      items = await this.prisma.dailyLog.findMany({ where, orderBy, take, cursor: { id: Number(cursorId) }, skip: 1 });
    } else {
      items = await this.prisma.dailyLog.findMany({ where, orderBy, take });
    }
    const nextCursor = items.length === take ? items[items.length - 1].id : null;
    return { items, nextCursor };
  }
}