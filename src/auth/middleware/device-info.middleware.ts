import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { UAParser } from 'ua-parser-js';
import { RequestWithDevice } from '../interfaces/auth-types';

@Injectable()
export class DeviceInfoMiddleware implements NestMiddleware {
  use(req: RequestWithDevice, _: any, next: NextFunction) {
    const parser = new UAParser(req.headers['user-agent'] || '');
    const result = parser.getResult();

    req.deviceInfo = {
      os: result.os.name || 'Unknown',
      osVersion: result.os.version || 'Unknown',
      browser: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || 'Unknown',
      device: result.device.model || 'Desktop',
      type: result.device.type || 'desktop',
    };

    next();
  }
}
