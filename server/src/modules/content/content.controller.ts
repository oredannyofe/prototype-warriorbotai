import { Controller, Get, Query, Header, Req, Res } from '@nestjs/common';
import { createHash } from 'crypto';
import type { Response, Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('content')
export class ContentController {
  constructor(private prisma: PrismaService) {}

  private static cache: { key: string; ts: number; items: any[] } | null = null;
  private static TTL = 15 * 60 * 1000; // 15 minutes

  @Get('education')
  @Header('Cache-Control', 'public, max-age=900, s-maxage=900')
  async education(@Query('lang') lang: string | undefined, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const key = lang ? `education:${lang}` : 'education:all';
    const now = Date.now();
    if (ContentController.cache && ContentController.cache.key === key && now - ContentController.cache.ts < ContentController.TTL) {
      return ContentController.cache.items;
    }
    const where = lang ? { language: lang } : {};
    const items = await this.prisma.contentItem.findMany({ where });
    const out = items.length ? items : [
      { id: 0, slug: 'hydration', title: 'Hydration & Prevention', body: 'Drink water regularly to reduce crises risk.', language: 'en', audience: 'adult' },
      { id: 0, slug: 'red-flags', title: 'When to go to hospital', body: 'Chest pain, trouble breathing, confusion, or high fever are emergencies — go now.', language: 'en', audience: 'adult' },
    ];
    ContentController.cache = { key, ts: now, items: out };
    // ETag support
    const bodyStr = JSON.stringify(out);
    const etag = 'W/"' + createHash('sha1').update(bodyStr).digest('hex') + '"';
    const inm = req.headers['if-none-match'];
    res.setHeader('ETag', etag);
    if (inm && inm === etag) {
      res.status(304);
      return [];
    }
    return out;
  }
}
