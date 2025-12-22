import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';

@Injectable()
export class PortfolioCleanupService {
  private readonly logger = new Logger(PortfolioCleanupService.name);

  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanup() {
    const deleteTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours

    const result = await this.portfolioRepository
      .createQueryBuilder()
      .delete()
      .from(Portfolio)
      .where('status = :status', { status: 'DRAFT' })
      .andWhere('updatedAt < :deleteTime', { deleteTime })
      .andWhere('(lastActiveAt IS NULL OR lastActiveAt < :deleteTime)', { deleteTime })
      .execute();

    if (result.affected && result.affected > 0) {
      this.logger.log(`Deleted ${result.affected} draft portfolios older than 24 hours`);
    }
  }
}
