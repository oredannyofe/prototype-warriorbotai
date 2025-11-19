import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtGuard } from '../../common/jwt.guard';
import { CurrentUser } from '../../common/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.prisma.user.findUnique({ where: { id: Number(id) }, include: { profile: true } });
  }

  @Post(':id/profile')
  upsertProfile(
    @Param('id') id: string,
    @Body()
    body: {
      genotype: string;
      age: number;
      country: string;
      city?: string;
      baselinePain?: number;
      triggers?: string[];
      meds?: string[];
      allergies?: string[];
      emergencyContacts?: any;
      hospital?: string;
    },
  ) {
    const userId = Number(id);
    return this.prisma.profile.upsert({
      where: { userId },
      create: { userId, ...body, baselinePain: body.baselinePain ?? 0, triggers: body.triggers ?? [], meds: body.meds ?? [], allergies: body.allergies ?? [] },
      update: { ...body },
    });
  }

  // Authenticated self profile endpoints
  @Get('me/profile')
  @UseGuards(JwtGuard)
  getMyProfile(@CurrentUser() user: { id: number }) {
    return this.prisma.profile.findUnique({ where: { userId: user.id } });
  }

  @Put('me/profile')
  @UseGuards(JwtGuard)
  upsertMyProfile(
    @CurrentUser() user: { id: number },
    @Body() body: { genotype?: string; age?: number; country?: string; city?: string; baselinePain?: number; triggers?: string[]; meds?: string[]; allergies?: string[]; emergencyContacts?: any; hospital?: string }
  ) {
    const userId = user.id;
    return this.prisma.profile.upsert({
      where: { userId },
      create: { userId, baselinePain: 0, triggers: [], meds: [], allergies: [], ...body },
      update: { ...body },
    });
  }
}
