import { Injectable } from '@nestjs/common';

@Injectable()
export class RequestCountService {
  private count = 0;

  increment(): number {
    this.count += 1;
    return this.count;
  }

  getCount(): number {
    return this.count;
  }
}
