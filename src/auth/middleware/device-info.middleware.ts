import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { UAParser } from 'ua-parser-js';
import { RequestWithDevice } from '../interfaces/auth-types';

@Injectable()
export class DeviceInfoMiddleware implements NestMiddleware {
  use(req: RequestWithDevice, res: Response, next: NextFunction) {
    const parser = new UAParser(req.headers['user-agent'] || '');
    const result = parser.getResult();

    const isDesktop = typeof result.device.type === 'undefined';

    req.deviceInfo = {
      os: result.os.name || 'Unknown',
      osVersion: result.os.version || 'Unknown',
      browser: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || 'Unknown',
      device: isDesktop ? 'Desktop' : result.device.model || 'Unknown',
      type: isDesktop ? 'desktop' : result.device.type || 'Unknown',
    };

    next();
  }
}
