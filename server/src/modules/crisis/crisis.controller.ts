import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function triageRule(i: { pain: number; chestPain?: boolean; dyspnea?: boolean; confusion?: boolean; fever?: boolean; }) {
  if (i.chestPain || i.dyspnea || i.confusion || i.fever) return 'red';
  if (i.pain >= 7) return 'yellow';
  if (i.pain <= 3) return 'green';
  return 'yellow';
}

@Controller('crisis')
export class CrisisController {
  constructor(private prisma: PrismaService) {}

  @Post('triage')
  async triage(@Body() body: { userId: number; location?: string; pain: number; chestPain?: boolean; dyspnea?: boolean; confusion?: boolean; fever?: boolean; triggers?: string[]; meds?: string[]; }) {
    const level = triageRule(body);
    const summary = level === 'red'
      ? 'Emergency symptoms detected — Go to hospital now.'
      : level === 'yellow'
        ? 'Monitor closely and consider calling your doctor.'
        : 'Manage at home with hydration, warmth, and rest.';
    const row = await this.prisma.crisisEvent.create({ data: { userId: body.userId, location: body.location ?? null, pain: body.pain, chestPain: !!body.chestPain, dyspnea: !!body.dyspnea, confusion: !!body.confusion, fever: !!body.fever, triggers: body.triggers ?? [], meds: body.meds ?? [], triage: level, summary } });
    return { level, summary, id: row.id };
  }
}