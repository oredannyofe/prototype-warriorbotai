import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('reports')
export class ReportsController {
  constructor(private prisma: PrismaService) {}

@Get(':userId/summary')
  @Header('Cache-Control', 'public, max-age=60, s-maxage=60')
  async summary(@Param('userId') userId: string, @Query('days') days = '30') {
    const d = Math.max(1, Math.min(180, Number(days)));
    const since = new Date(Date.now() - d * 24 * 3600 * 1000);
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        COALESCE((SELECT AVG(pain) FROM "DailyLog" WHERE "userId"=${Number(userId)} AND "createdAt">=${since}),0) AS avg_pain,
        (SELECT COUNT(*) FROM "CrisisEvent" WHERE "userId"=${Number(userId)} AND "createdAt">=${since}) AS crisis_count,
        (SELECT COUNT(*) FROM "CrisisEvent" WHERE "userId"=${Number(userId)} AND "createdAt">=${since} AND (EXTRACT(HOUR FROM "createdAt")<6 OR EXTRACT(HOUR FROM "createdAt")>=22)) AS night_crises
    `;
    const r = rows?.[0] || { avg_pain: 0, crisis_count: 0, night_crises: 0 };
    const avgPain = Math.round(Number(r.avg_pain) * 100) / 100;
    const crisisCount = Number(r.crisis_count);
    const nightCrises = Number(r.night_crises);
    return { days: d, crisisCount, avgPain, patterns: { nightCrises } };
  }
}
