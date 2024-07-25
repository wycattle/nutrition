// service/totals_by_date_range.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['query', 'info', `warn`, `error`],
});

export class DailyTotals {
  async getDailyTotals(startDate: string, endDate: string) {
    const dailyTotals = await prisma.dailyTotalsByDateRange.findMany({
      where: {
        day:{ 
          gte: new Date(startDate),
          lte: new Date(endDate),
      }},
    });

    console.log(dailyTotals);
    return dailyTotals;
  }
}