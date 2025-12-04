import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private count = 0;
  getHello(): string {
    this.count += 1;
    console.log(`getHello has been called ${this.count} times.`);
    return 'Hello World!';
  }
}
