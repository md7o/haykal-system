import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PendingRegistrationService } from './pending-registration.service';
import { ResetPasswordService } from './rest-password.service';

@Injectable()
export class ExpiredEntitiesCleanupService {
  constructor(
    private readonly pendingService: PendingRegistrationService,
    private readonly resetPasswordService: ResetPasswordService,
  ) {}

  // Runs every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanup() {
    const now = new Date();
    await this.pendingService.deleteExpiredPending(now);
    await this.resetPasswordService.deleteExpiredResets(now);
  }
}
