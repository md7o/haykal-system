import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestCountService } from '../services/request-count.service';

@Injectable()
export class RequestCountMiddleware implements NestMiddleware {
  constructor(private readonly counter: RequestCountService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const current = this.counter.increment();
    // Expose current count for visibility in responses
    res.setHeader('X-Request-Count', String(current));

    // Log to console for quick visibility and to Pino (if attached to request)
    try {
      // eslint-disable-next-line no-console
      console.log(`Request #${current} - ${req.method} ${req.originalUrl || req.url}`);
      // If pino-http attached a logger to the request, log there too
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyReq = req as any;
      if (anyReq && anyReq.log && typeof anyReq.log.info === 'function') {
        anyReq.log.info({ requestCount: current }, 'Request count');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to log request count', err);
    }

    next();
  }
}
