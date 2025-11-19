import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtGuard } from '../../common/jwt.guard';
import { CurrentUser } from '../../common/user.decorator';

@Controller('reminders')
@UseGuards(JwtGuard)
export class RemindersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() user: { id: number }, @Query('limit') limit = '50', @Query('offset') offset = '0') {
    const take = Math.max(1, Math.min(100, Number(limit)));
    const skip = Math.max(0, Number(offset));
    return this.prisma.reminder.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take, skip });
  }

  @Post()
  create(
    @CurrentUser() user: { id: number },
    @Body() body: { type: 'hydration' | 'medication'; label: string; timeHM: string; enabled?: boolean },
  ) {
    if (!/^([01]?\d|2[0-3]):([0-5]\d)$/.test(body.timeHM)) throw new BadRequestException('timeHM must be HH:mm (24h)');
    if (!body.label?.trim()) throw new BadRequestException('label required');
    return this.prisma.reminder.create({ data: { userId: user.id, type: body.type, label: body.label.trim(), timeHM: body.timeHM, enabled: body.enabled ?? true } });
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: number },
    @Param('id') id: string,
    @Body() body: Partial<{ label: string; timeHM: string; enabled: boolean }>,
  ) {
    return this.prisma.reminder.update({ where: { id: Number(id) }, data: { ...body } });
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: number }, @Param('id') id: string) {
    return this.prisma.reminder.delete({ where: { id: Number(id) } });
  }
}