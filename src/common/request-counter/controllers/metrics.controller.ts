import { Controller, Get } from '@nestjs/common';
import { RequestCountService } from '../services/request-count.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly counter: RequestCountService) {}

  @Get('requests')
  getRequests() {
    return { count: this.counter.getCount() };
  }
}
